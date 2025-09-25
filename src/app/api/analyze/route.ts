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

  const { text, options } = await req.json();
  const source = String(text || "");

  // Derive effective policy from options
  const policyMode: "Observe" | "Soft" | "Hard" = options?.policyMode || "Observe";
  const defaultRemoveVS = policyMode === "Soft" || policyMode === "Hard";
  const defaultRemoveTags = policyMode === "Hard" || policyMode === "Soft"; // enable in Soft/Hard
  const removeVarSelectors = options?.removeVarSelectors ?? defaultRemoveVS;
  const removeTags = options?.removeTags ?? defaultRemoveTags;

  // Apply optional sanitization before analysis (VS and TAG ranges)
  let working = source;
  if (removeVarSelectors) {
    // FE00–FE0F and E0100–E01EF
    working = working.replace(/[\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu, "");
  }
  if (removeTags) {
    // E0000–E007F (Unicode TAG characters)
    working = working.replace(/[\u{E0000}-\u{E007F}]/gu, "");
  }

  const res = analyzeText(working, source);

  if (res.overallRisk >= 70 || res.alerts.length) {
    log("alert", "High risk content analyzed", { alerts: res.alerts, overall: res.overallRisk });
  } else {
    log("info", "Content analyzed", { overall: res.overallRisk });
  }

  return Response.json(res, { headers: SEC_HEADERS });
}