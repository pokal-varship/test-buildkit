const TRUE_VALUES = new Set(["true", "1", "yes"]);

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * Next.js only inlines static `process.env.NEXT_PUBLIC_*` references in the
 * client bundle. Dynamic access like `process.env[key]` is always undefined
 * in the browser — use direct property access below.
 */
const MQTT_ENV = {
  enabled: stripEnvQuotes(process.env.NEXT_PUBLIC_ISOMETRIC_MQTT_ENABLED ?? ""),
  host: stripEnvQuotes(process.env.NEXT_PUBLIC_ISOMETRIC_MQTT_HOST ?? ""),
  port: stripEnvQuotes(process.env.NEXT_PUBLIC_ISOMETRIC_MQTT_PORT ?? ""),
  mqttUsername: stripEnvQuotes(
    process.env.NEXT_PUBLIC_ISOMETRIC_MQTT_USERNAME ?? "",
  ),
  mqttPassword: stripEnvQuotes(
    process.env.NEXT_PUBLIC_ISOMETRIC_MQTT_PASSWORD ?? "",
  ),
  appSecret: stripEnvQuotes(process.env.NEXT_PUBLIC_ISOMETRIC_APP_SECRET ?? ""),
  licenseKey: stripEnvQuotes(
    process.env.NEXT_PUBLIC_ISOMETRIC_LICENSE_KEY ?? "",
  ),
} as const;

export type IsometrikMqttConfigStatus = {
  enabled: boolean;
  hasHost: boolean;
  hasUsername: boolean;
  hasPassword: boolean;
  isConfigured: boolean;
  usernameSource: "env" | "appSecret" | "none";
};

export type IsometrikMqttConfig = {
  enabled: boolean;
  host: string;
  port: number;
  username: string;
  password: string;
  usernameSource: IsometrikMqttConfigStatus["usernameSource"];
};

function isPublishOrSubscribeKey(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("sub-") || normalized.startsWith("pub-");
}

function resolveMqttCredentials(): Pick<
  IsometrikMqttConfig,
  "username" | "password" | "usernameSource"
> {
  const explicitUsername = MQTT_ENV.mqttUsername;
  const explicitPassword = MQTT_ENV.mqttPassword;

  if (explicitUsername && !isPublishOrSubscribeKey(explicitUsername)) {
    return {
      username: explicitUsername,
      password: explicitPassword || MQTT_ENV.licenseKey,
      usernameSource: "env",
    };
  }

  if (MQTT_ENV.appSecret && MQTT_ENV.licenseKey) {
    return {
      username: MQTT_ENV.appSecret,
      password: MQTT_ENV.licenseKey,
      usernameSource: "appSecret",
    };
  }

  return {
    username: "",
    password: "",
    usernameSource: "none",
  };
}

export function getIsometrikMqttConfig(): IsometrikMqttConfig {
  const { username, password, usernameSource } = resolveMqttCredentials();

  return {
    enabled: TRUE_VALUES.has(MQTT_ENV.enabled.toLowerCase()),
    host: MQTT_ENV.host,
    port: Number(MQTT_ENV.port || "2053"),
    username,
    password,
    usernameSource,
  };
}

export function getIsometrikMqttConfigStatus(): IsometrikMqttConfigStatus {
  const config = getIsometrikMqttConfig();

  return {
    enabled: config.enabled,
    hasHost: Boolean(config.host),
    hasUsername: Boolean(config.username),
    hasPassword: Boolean(config.password),
    isConfigured: isIsometrikMqttConfigured(config),
    usernameSource: config.usernameSource,
  };
}

export function isIsometrikMqttConfigured(
  config: IsometrikMqttConfig = getIsometrikMqttConfig(),
): boolean {
  return Boolean(
    config.enabled && config.host && config.username && config.password,
  );
}

/** `stores/{storefrontId}/orders/listing/status` */
export function buildOrderListingStatusTopic(storefrontId: string): string {
  return `stores/${storefrontId}/orders/listing/status`;
}

/** `stores/{storefrontId}/orders/{orderId}/status` */
export function buildOrderDetailStatusTopic(
  storefrontId: string,
  orderId: string,
): string {
  return `stores/${storefrontId}/orders/${orderId}/status`;
}

const ORDER_DETAIL_STATUS_TOPIC_RE =
  /^stores\/[^/]+\/orders\/([^/]+)\/status$/;

export function parseOrderIdFromDetailStatusTopic(topic: string): string | null {
  const match = ORDER_DETAIL_STATUS_TOPIC_RE.exec(topic.trim());
  return match?.[1] ?? null;
}
