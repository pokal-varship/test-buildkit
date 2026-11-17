function payloadToString(rawPayload: string | Buffer | Uint8Array): string {
  if (typeof rawPayload === "string") return rawPayload;

  if (typeof TextDecoder !== "undefined") {
    const bytes =
      rawPayload instanceof Uint8Array
        ? rawPayload
        : new Uint8Array(rawPayload);
    return new TextDecoder().decode(bytes);
  }

  return String(rawPayload);
}

export function decodeMqttPayload(
  rawPayload: string | Buffer | Uint8Array,
): Record<string, unknown> | null {
  const trimmed = payloadToString(rawPayload).trim();
  if (!trimmed) return null;

  try {
    const decoded: unknown = JSON.parse(trimmed);

    if (decoded && typeof decoded === "object" && !Array.isArray(decoded)) {
      return decoded as Record<string, unknown>;
    }

    return { message: decoded };
  } catch {
    return { message: trimmed };
  }
}
