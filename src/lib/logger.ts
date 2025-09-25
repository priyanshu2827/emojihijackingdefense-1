type LogLevel = "info" | "warn" | "error" | "alert";

export interface LogEntry {
  id: number;
  ts: number;
  level: LogLevel;
  message: string;
  meta?: Record<string, any>;
}

const store: LogEntry[] = [];
let id = 1;

export function log(level: LogLevel, message: string, meta?: Record<string, any>) {
  const entry: LogEntry = { id: id++, ts: Date.now(), level, message, meta };
  store.unshift(entry);
  if (level === "error" || level === "alert") {
    // eslint-disable-next-line no-console
    console.warn(`[${level.toUpperCase()}]`, message, meta || "");
  }
  return entry;
}

export function getLogs(limit = 100): LogEntry[] {
  return store.slice(0, limit);
}

export function clearLogs() {
  store.length = 0;
}