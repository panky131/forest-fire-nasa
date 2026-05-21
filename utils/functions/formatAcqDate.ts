export type AcqDateDisplay = {
  /** e.g. Mon, 15 Mar 2025 */
  dateLine: string;
  /** e.g. 02:30 PM */
  timeLine: string;
  /** Full line: date + time */
  fullLine: string;
};

/** Parse MySQL-style `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss` as local wall time. */
function parseAcqDateTime(raw: string): Date | null {
  const trimmed = raw.trim();
  const mysql = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (mysql) {
    const y = Number(mysql[1]);
    const mo = Number(mysql[2]) - 1;
    const d = Number(mysql[3]);
    const h = Number(mysql[4] ?? 0);
    const mi = Number(mysql[5] ?? 0);
    const s = Number(mysql[6] ?? 0);
    const dt = new Date(y, mo, d, h, mi, s);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const dt = new Date(normalized);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Display `acq_date` from the alerts API (datetime column). */
export function formatAcqDate(value: unknown): AcqDateDisplay | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw || raw === "0000-00-00" || raw === "0000-00-00 00:00:00") return null;

  const d = parseAcqDateTime(raw);
  if (!d) {
    return { dateLine: raw, timeLine: "", fullLine: raw };
  }

  const dateLine = d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLine = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const hasTime =
    raw.includes(":") ||
    d.getHours() !== 0 ||
    d.getMinutes() !== 0 ||
    d.getSeconds() !== 0;

  const fullLine = hasTime ? `${dateLine} · ${timeLine}` : dateLine;

  return { dateLine, timeLine: hasTime ? timeLine : "", fullLine };
}

/** Single string for simple labels. */
export function formatAcqDateLine(value: unknown): string {
  const parts = formatAcqDate(value);
  if (!parts) return "—";
  return parts.fullLine;
}
