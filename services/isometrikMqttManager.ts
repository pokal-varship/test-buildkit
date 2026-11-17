import { v4 as uuidv4 } from "uuid";
import mqtt, { type MqttClient } from "mqtt";

import {
  getIsometrikMqttConfig,
  isIsometrikMqttConfigured,
} from "@config/isometrikMqtt.config";
import { decodeMqttPayload } from "@lib/mqtt/decodeMqttPayload";

type MqttLifecycleStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

type MqttCallbacks = {
  onStatus?: (status: MqttLifecycleStatus, meta?: { reason?: string }) => void;
  onEvent?: (event: {
    topic: string;
    payload: Record<string, unknown>;
  }) => void;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function maskSecret(value: string): string {
  if (!value) return "(empty)";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function log(message: string, isError = false): void {
  if (process.env.NODE_ENV !== "development") return;

  const prefix = isError ? "[OrderMQTT] ERROR" : "[OrderMQTT]";
  if (isError) {
    console.error(prefix, message);
    return;
  }
  console.log(prefix, message);
}

function isAuthenticationFailure(message: string): boolean {
  return /not authorized|not authorised|bad user|bad username|bad password|connection refused: not authorized/i.test(
    message,
  );
}

function normalizeTopics(topics: string[]): string[] {
  return topics
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)
    .sort();
}

export class IsometrikMqttManager {
  private client: MqttClient | null = null;
  private callbacks: MqttCallbacks | null = null;
  private subscribedTopics = new Set<string>();
  private desiredTopics = new Set<string>();
  private desiredTopicsKey = "";
  private intentionalDisconnect = false;
  private authFailed = false;
  private lastAuthKey: string | null = null;

  connect(args?: { callbacks?: MqttCallbacks }): void {
    if (!isBrowser()) return;

    if (args?.callbacks) {
      this.callbacks = args.callbacks;
    }

    const config = getIsometrikMqttConfig();
    if (!isIsometrikMqttConfigured(config)) {
      log("MQTT disabled or missing configuration", true);
      return;
    }

    if (this.authFailed) {
      return;
    }

    const authKey = `${config.username}::${config.password.length}`;
    if (this.client?.connected && this.lastAuthKey === authKey) {
      return;
    }

    if (this.client && this.lastAuthKey !== authKey) {
      this.disconnect();
    }

    if (this.client) {
      return;
    }

    this.lastAuthKey = authKey;
    this.intentionalDisconnect = false;
    this.openClient(config);
  }

  syncTopics(topics: string[]): void {
    if (!isBrowser()) return;
    if (this.authFailed) return;

    const normalized = normalizeTopics(topics);
    const nextKey = normalized.join("\0");

    if (nextKey === this.desiredTopicsKey) {
      return;
    }

    this.desiredTopicsKey = nextKey;
    this.desiredTopics = new Set(normalized);

    const config = getIsometrikMqttConfig();
    if (!isIsometrikMqttConfigured(config)) return;

    if (!this.client) {
      this.connect();
      return;
    }

    if (this.client.connected) {
      this.applyTopicDiff();
    }
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.authFailed = false;

    const client = this.client;
    this.client = null;
    this.lastAuthKey = null;
    this.subscribedTopics.clear();
    this.desiredTopics.clear();
    this.desiredTopicsKey = "";

    if (!client) {
      this.setStatus("idle");
      this.intentionalDisconnect = false;
      return;
    }

    log(`Disconnecting client ${client.options.clientId ?? ""}`);

    try {
      client.options.reconnectPeriod = 0;
      client.removeAllListeners();
      client.end(true);
    } catch (error) {
      log(`Disconnect error: ${String(error)}`, true);
    }

    this.setStatus("disconnected");
    this.intentionalDisconnect = false;
  }

  private openClient(
    config: ReturnType<typeof getIsometrikMqttConfig>,
  ): void {
    const clientId = `nk_customer_${uuidv4()}`;

    log(
      `Connecting | host=${config.host} | port=${config.port} | clientId=${clientId} | usernameSource=${config.usernameSource} | username=${maskSecret(config.username)}`,
    );

    this.setStatus("connecting");

    const brokerUrl = config.host.includes("://")
      ? config.host
      : `wss://${config.host}:${config.port}/mqtt`;

    let client: MqttClient;

    try {
      client = mqtt.connect(brokerUrl, {
        clientId,
        username: config.username,
        password: config.password,
        protocolVersion: 4,
        keepalive: 20,
        clean: true,
        reconnectPeriod: 2000,
        connectTimeout: 30_000,
        wsOptions: {
          protocol: "mqtt",
        },
      });
    } catch (error) {
      log(`Client constructor failed: ${String(error)}`, true);
      this.setStatus("error", { reason: "constructor-failed" });
      return;
    }

    this.client = client;

    client.on("connect", () => {
      log("Broker connected");
      this.setStatus("connected");
      this.subscribedTopics.clear();
      this.applyTopicDiff();
    });

    client.on("message", (topic, rawPayload) => {
      const payload = decodeMqttPayload(rawPayload);
      if (!payload) {
        log(`Failed to decode payload on topic: ${topic}`, true);
        return;
      }

      log(`Message on ${topic}`);
      this.callbacks?.onEvent?.({ topic, payload });
    });

    client.on("reconnect", () => {
      if (this.intentionalDisconnect || this.authFailed) return;
      log("Broker reconnecting");
      this.setStatus("reconnecting");
    });

    client.on("offline", () => {
      if (this.intentionalDisconnect || this.authFailed) return;
      log("Broker offline (network unavailable)", true);
      this.subscribedTopics.clear();
      this.setStatus("disconnected");
    });

    client.on("close", () => {
      if (this.intentionalDisconnect) {
        this.setStatus("disconnected");
        return;
      }
      if (this.authFailed) {
        this.setStatus("error", { reason: "not-authorized" });
        return;
      }
      this.subscribedTopics.clear();
      log("Broker connection closed", true);
      this.setStatus("disconnected");
    });

    client.on("error", (error) => {
      log(`Broker error: ${error.message}`, true);
      if (isAuthenticationFailure(error.message)) {
        this.stopClientAfterAuthFailure(client, error.message);
        return;
      }
      this.setStatus("error", { reason: error.message });
    });
  }

  private stopClientAfterAuthFailure(client: MqttClient, reason: string): void {
    if (this.authFailed) return;

    this.authFailed = true;
    this.intentionalDisconnect = true;

    try {
      client.options.reconnectPeriod = 0;
      client.removeAllListeners();
      client.end(true);
    } catch (error) {
      log(`Auth failure cleanup error: ${String(error)}`, true);
    }

    this.client = null;
    this.lastAuthKey = null;
    this.subscribedTopics.clear();
    this.intentionalDisconnect = false;
    this.setStatus("error", { reason });
    log(
      "Stopped reconnecting after authentication failure. Check APP_SECRET (username) and LICENSE_KEY (password) in .env.",
      true,
    );
  }

  private applyTopicDiff(): void {
    const client = this.client;
    if (!client?.connected) return;

    for (const topic of this.subscribedTopics) {
      if (!this.desiredTopics.has(topic)) {
        log(`Unsubscribing from topic: ${topic}`);
        client.unsubscribe(topic);
        this.subscribedTopics.delete(topic);
      }
    }

    for (const topic of this.desiredTopics) {
      if (!this.subscribedTopics.has(topic)) {
        log(`Subscribing to topic: ${topic}`);
        client.subscribe(topic, { qos: 0 });
        this.subscribedTopics.add(topic);
      }
    }
  }

  private setStatus(
    status: MqttLifecycleStatus,
    meta?: { reason?: string },
  ): void {
    this.callbacks?.onStatus?.(status, meta);
  }
}

export const isometrikMqttManager = new IsometrikMqttManager();
