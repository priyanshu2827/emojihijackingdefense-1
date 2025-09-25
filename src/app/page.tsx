"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DetectionMatrix from "@/components/DetectionMatrix";
import LogsPanel from "@/components/LogsPanel";
import { AttackList, MethodList } from "@/lib/unicode/engine";
import type { AnalysisResult } from "@/lib/unicode/types";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [batchInfo, setBatchInfo] = useState<{ count: number; alerts: number } | null>(null);
  // Policy Mode selector
  const [policyMode, setPolicyMode] = useState<"Observe" | "Soft" | "Hard">("Observe");
  // copy feedback
  const [copied, setCopied] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: JSON.stringify({ text, options: { policyMode } }), headers: { "Content-Type": "application/json" } });
      const json = await res.json();
      setResult(json);
    } finally {
      setLoading(false);
    }
  }

  async function runBatch() {
    const items = [
      "Normal hello world",
      "pаypal.com – visit n\u200Bow ✅",
      "Click 🇺🇸🏳️‍⚧️🏁 for prize!!!",
      "𝖋𝖗𝖊𝖊 𝖌𝖎𝖋𝖙 𝖈𝖆𝖗𝖉",
    ];
    const res = await fetch("/api/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    const json = await res.json();
    const alerts = json.results.flatMap((r: any) => r.alerts || []).length;
    setBatchInfo({ count: json.count || 0, alerts });
  }

  const riskColor = useMemo(() => {
    const s = result?.overallRisk ?? 0;
    if (s >= 70) return "bg-red-500 text-white";
    if (s >= 40) return "bg-amber-500 text-white";
    return "bg-emerald-500 text-white";
  }, [result]);

  // Build/info banner
  const commit = process.env.NEXT_PUBLIC_COMMIT_SHA || "dev";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || "local";

  // Helpers: copy/export
  const handleCopySanitized = async () => {
    if (!result?.sanitized) return;
    try {
      await navigator.clipboard.writeText(result.sanitized);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  function download(name: string, content: string, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildJSONL(r: AnalysisResult) {
    const line = {
      input: text,
      sanitized: r.sanitized,
      normalized: r.normalized,
      overallRisk: r.overallRisk,
      alerts: r.alerts,
      tokenDriftRatio: r.tokenDriftRatio,
      summary: r.summary,
    };
    return JSON.stringify(line) + "\n";
  }

  function buildSARIF(r: AnalysisResult) {
    const results = (r.alerts || []).map((a) => ({
      ruleId: a.split(" ")[0] || "unicode-risk",
      level: r.overallRisk >= 70 ? "error" : r.overallRisk >= 40 ? "warning" : "note",
      message: { text: a },
      locations: [{
        physicalLocation: {
          artifactLocation: { uri: "stdin" },
        },
      }],
    }));
    const sarif = {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: { driver: { name: "EHP Unicode Detector", version: buildTime } },
          results,
        },
      ],
    } as const;
    return JSON.stringify(sarif, null, 2);
  }

  const handleExportJSONL = () => {
    if (!result) return;
    download(`ehp-analysis-${commit.slice(0, 8)}.jsonl`, buildJSONL(result));
  };

  const handleExportSARIF = () => {
    if (!result) return;
    download(`ehp-analysis-${commit.slice(0, 8)}.sarif`, buildSARIF(result));
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-6">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Preview banner */}
        <div className="w-full rounded-md border bg-amber-50 text-amber-900 px-3 py-2 text-sm flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">Preview Only</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">Policy: {policyMode}</span>
            <span className="text-xs">SHA: {commit.slice(0, 8)}</span>
            <span className="text-xs">Build: {buildTime}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold">Unicode Attack Detection System</h1>
        <p className="text-muted-foreground">Analyze text for Unicode-based obfuscation and threats. Pipeline: preprocessing → detection → analysis → visualization.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste potentially unsafe content to analyze.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter or paste text containing tricky Unicode…" rows={8} />
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={analyze} disabled={loading}>
                  {loading ? "Analyzing…" : "Analyze"}
                </Button>
                <Button variant="secondary" onClick={() => setText("")}>Clear</Button>
                <Button variant="outline" onClick={() => setText("pаypal.com – visit n\u0000b\u0000b\u0000bow ✅")}>Load Demo</Button>
                <Button variant="outline" onClick={runBatch}>Run Batch Demo</Button>
                {/* Policy Mode selector */}
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Policy</label>
                  <select
                    className="text-sm rounded-md border bg-background px-2 py-1"
                    value={policyMode}
                    onChange={(e) => setPolicyMode(e.target.value as any)}
                  >
                    <option value="Observe">Observe</option>
                    <option value="Soft">Soft</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                {batchInfo ? (
                  <span className="text-xs text-muted-foreground">Batch: {batchInfo.count} items · {batchInfo.alerts} alerts</span>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Normalization, tokens, and risk overview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md ${riskColor}`}>
                <span className="font-semibold">Overall Risk</span>
                <span>{result?.overallRisk ?? 0}%</span>
              </div>
              {/* Tokenization drift */}
              {result ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Token Drift</span>
                  <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">
                    {result.rawTokens?.length ?? 0} → {result.tokens.length} (x{result.tokenDriftRatio ?? 0})
                  </span>
                </div>
              ) : null}
              {/* Sanitized (pre-normalization) */}
              {result?.sanitized ? (
                <div>
                  <div className="text-sm text-muted-foreground">Sanitized (per policy)</div>
                  <div className="text-sm break-words mt-1">{result.sanitized}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopySanitized}>{copied ? "Copied" : "Copy Sanitized"}</Button>
                    <Button size="sm" variant="outline" onClick={handleExportJSONL}>Export JSONL</Button>
                    <Button size="sm" variant="outline" onClick={handleExportSARIF}>Export SARIF</Button>
                  </div>
                </div>
              ) : null}
              <div>
                <div className="text-sm text-muted-foreground">NFKC Normalized</div>
                <div className="text-sm break-words mt-1">{result?.normalized ?? ""}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tokens</div>
                <div className="text-xs mt-1 flex flex-wrap gap-1">
                  {result?.tokens.map((t, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
                  ))}
                </div>
              </div>
              {result?.rawTokens ? (
                <div>
                  <div className="text-sm text-muted-foreground">Raw Tokens (pre-normalization)</div>
                  <div className="text-xs mt-1 flex flex-wrap gap-1">
                    {result.rawTokens.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {result?.alerts?.length ? (
                <div>
                  <div className="text-sm text-muted-foreground">Alerts</div>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    {result.alerts.map((a, i) => (<li key={i}>{a}</li>))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {result ? (
          <DetectionMatrix data={result.matrix} attacks={AttackList} methods={MethodList} />
        ) : (
          <div className="rounded-xl border p-6 bg-card text-muted-foreground">Run an analysis to populate the detection matrix.</div>
        )}

        {result ? (
          <Card>
            <CardHeader>
              <CardTitle>Attack Breakdown</CardTitle>
              <CardDescription>Detailed scores and reasons for each attack type.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(result.summary).map(([name, s]) => (
                  <div key={name} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{name}</div>
                      <div className="text-sm">{s.score}%</div>
                    </div>
                    {s.reasons?.length ? (
                      <ul className="list-disc pl-5 text-sm mt-1 text-muted-foreground">
                        {s.reasons.map((r, i) => (<li key={i}>{r}</li>))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">No notable indicators.</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Sanitization Diff */}
        {result?.sanitized ? (
          <Card>
            <CardHeader>
              <CardTitle>Sanitization Diff</CardTitle>
              <CardDescription>Side-by-side view and removed code-point annotations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Original</div>
                  <div className="text-sm break-words whitespace-pre-wrap">{text}</div>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Sanitized</div>
                  <div className="text-sm break-words whitespace-pre-wrap">{result.sanitized}</div>
                </div>
              </div>
              {result.removed?.length ? (
                <div>
                  <div className="text-sm text-muted-foreground">Removed code points</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.removed.map((r, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded border bg-accent text-accent-foreground" title={`${r.hex} ${r.char}`}>
                        {r.hex}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No characters removed by current policy.</div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <LogsPanel />

      </div>
    </div>
  );
}