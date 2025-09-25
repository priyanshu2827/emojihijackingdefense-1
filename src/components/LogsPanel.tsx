"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LogEntry {
  id: number;
  ts: number;
  level: "info" | "warn" | "error" | "alert";
  message: string;
  meta?: Record<string, any>;
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      setLogs(json.logs || []);
    } finally {
      setLoading(false);
    }
  }

  async function clearAll() {
    await fetch("/api/reports", { method: "DELETE" });
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Security Logs</CardTitle>
          <CardDescription>Latest alerts and analysis events.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={refresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</Button>
          <Button size="sm" variant="outline" onClick={clearAll}>Clear</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-auto space-y-2">
          {logs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No logs yet.</div>
          ) : (
            logs.map((l) => (
              <div key={l.id} className="border rounded-md p-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">[{l.level.toUpperCase()}]</span>
                  <span className="text-muted-foreground">{new Date(l.ts).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm">{l.message}</div>
                {l.meta ? (
                  <pre className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">{JSON.stringify(l.meta)}</pre>
                ) : null}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}