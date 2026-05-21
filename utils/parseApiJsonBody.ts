/**
 * Parse API response text as a JSON object (not a root-level array).
 * Avoids throwing when the server returns HTML or plain text.
 */
export function parseApiJsonObject(raw: string): Record<string, unknown> | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const v: unknown = JSON.parse(t);
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function apiErrorMessageFromBody(
  obj: Record<string, unknown> | null
): string {
  if (!obj) return "Unexpected response from server.";
  const m = obj.message ?? obj.msg ?? obj.error;
  if (typeof m === "string" && m.trim()) return m.trim();
  return "Unexpected response from server.";
}
