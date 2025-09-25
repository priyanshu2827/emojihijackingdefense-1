import { NextRequest } from "next/server";
import { getLogs, log, clearLogs } from "@/lib/logger";

export async function GET() {
  return Response.json({ logs: getLogs(200) });
}

export async function POST(req: NextRequest) {
  const { level = "info", message = "", meta } = await req.json();
  const entry = log(level, message, meta);
  return Response.json({ ok: true, entry });
}

export async function DELETE() {
  clearLogs();
  return Response.json({ ok: true });
}