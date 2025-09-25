import { NextRequest } from "next/server";
import { analyzeText } from "@/lib/unicode/engine";
import { log } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const SEC_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
  };

  // Lightweight token gate for preview environments (optional)
  const expected = process.env.PREVIEW_API_TOKEN;
  if (expected) {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (token !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...SEC_HEADERS, "Content-Type": "application/json" },
      });
    }
  }

  const { items } = await req.json();
  const arr: string[] = Array.isArray(items) ? items : [];
  const results = arr.map((t) => analyzeText(String(t || "")));
  const alerts = results.flatMap((r) => r.alerts);
  if (alerts.length) log("alert", "Batch alerts", { count: alerts.length });
  return Response.json({ count: results.length, results }, { headers: SEC_HEADERS });
}