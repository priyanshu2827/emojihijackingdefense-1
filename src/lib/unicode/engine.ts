import { AnalysisResult, AttackType, DetectionCell, DetectionMethod } from "./types";
import { nfkc, tokenize, graphemeClusters, codePoints } from "./preprocess";

const ATTACKS: AttackType[] = [
  "Mixed Script",
  "Invisible Char",
  "Grapheme Spoof",
  "Unicode Cat",
  "Emoji C2 Cmd",
  "Var Selector",
  "Zero-Width Steg",
  "Token Seg Bias",
];

const METHODS: DetectionMethod[] = [
  "NFKC Norm",
  "Grapheme Anal",
  "Stat Pattern",
  "ML Classify",
  "Rule Filter",
  "Token Anal",
  "Unicode Cat",
  "Var Sel Det",
];

function pct(x: number, max = 1) {
  const v = Math.max(0, Math.min(1, x / max));
  return Math.round(v * 100);
}

// Heuristic detectors (lightweight but expressive)
function detectMixedScript(text: string): { score: number; reasons: string[] } {
  const scripts = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    // rough script buckets
    const sname =
      (cp >= 0x0400 && cp <= 0x04FF) ? "Cyrillic" :
      (cp >= 0x0370 && cp <= 0x03FF) ? "Greek" :
      (cp >= 0x0041 && cp <= 0x007A) ? "Latin" :
      (cp >= 0x0600 && cp <= 0x06FF) ? "Arabic" :
      (cp >= 0x4E00 && cp <= 0x9FFF) ? "Han" :
      "Other";
    if (/\p{L}/u.test(ch)) scripts.add(sname);
  }
  const sc = scripts.size;
  const score = sc > 1 ? pct(sc - 1, 4) : 0;
  const reasons = sc > 1 ? ["Multiple writing systems detected: " + Array.from(scripts).join(", ")] : [];
  return { score, reasons };
}

function detectInvisible(text: string) {
  const invis = /[\u200B-\u200D\u2060\u2061\uFEFF\u034F]/g; // zero-width and CGJ
  const matches = text.match(invis) || [];
  const score = matches.length ? Math.min(100, matches.length * 25) : 0;
  const reasons = matches.length ? ["Invisible characters count: " + matches.length] : [];
  return { score, reasons };
}

function detectGraphemeSpoof(text: string) {
  const clusters = graphemeClusters(text);
  // Heuristic: multiple code points forming single cluster unusually often
  const multi = clusters.filter((g) => Array.from(g).length > 1).length;
  const ratio = clusters.length ? multi / clusters.length : 0;
  return { score: pct(ratio, 0.6), reasons: multi ? ["Complex graphemes ratio " + (ratio * 100).toFixed(1) + "%"] : [] };
}

function detectUnicodeCategories(text: string) {
  const cps = codePoints(text);
  const marks = cps.filter((cp) => /\p{M}/u.test(String.fromCodePoint(cp))).length;
  const symbols = cps.filter((cp) => /\p{S}/u.test(String.fromCodePoint(cp))).length;
  const score = pct((marks + symbols) / (cps.length || 1), 0.5);
  const reasons = score ? ["High non-letter category usage"] : [];
  return { score, reasons };
}

function detectEmojiC2(text: string) {
  // Suspicious sequences like keycaps, flags, variation indicators near letters
  const suspicious = /(\p{Emoji}(?:\uFE0F)?){3,}|(\p{Emoji_Presentation}\uFE0F?\u20E3)/gu;
  const cnt = Array.from(text.matchAll(suspicious)).length;
  const score = cnt ? Math.min(100, 30 + cnt * 20) : 0;
  return { score, reasons: cnt ? ["Dense emoji patterns detected"] : [] };
}

function detectVarSelector(text: string) {
  const vs = /[\uFE00-\uFE0F\uE0100-\uE01EF]/gu; // VS & IVS
  const cntVS = (text.match(vs) || []).length;
  // Explicit TAG characters U+E0000–U+E007F
  const tags = /[\u{E0000}-\u{E007F}]/gu;
  const cntTAG = (text.match(tags) || []).length;
  const cnt = cntVS + cntTAG;
  const score = cnt ? Math.min(100, 20 + cnt * 20) : 0;
  const reasons = cnt ? [
    `Variation Selectors used: ${cntVS}`,
    ...(cntTAG ? [`Unicode TAG characters used: ${cntTAG}`] : []),
  ] : [];
  return { score, reasons };
}

function detectZeroWidthSteg(text: string) {
  const zw = /[\u200B\u200C\u200D\u2060]/g;
  const cnt = (text.match(zw) || []).length;
  const score = cnt > 3 ? Math.min(100, 40 + cnt * 10) : cnt ? 20 : 0;
  return { score, reasons: cnt ? ["Zero-width characters: " + cnt] : [] };
}

function detectTokenSegBias(text: string) {
  const tokens = tokenize(text).filter((t) => !/^\s+$/.test(t));
  const long = tokens.filter((t) => t.length >= 20).length;
  const tiny = tokens.filter((t) => t.length <= 2).length;
  const ratio = tokens.length ? (long + tiny) / tokens.length : 0;
  return { score: pct(ratio, 0.5), reasons: ratio ? ["Unusual token length distribution"] : [] };
}

// Pseudo-ML classifier (lightweight ensemble of heuristics mapped to 0..1)
function mlClassifyRisk(text: string): number {
  const r = [
    detectMixedScript(text).score,
    detectInvisible(text).score,
    detectGraphemeSpoof(text).score,
    detectUnicodeCategories(text).score,
    detectEmojiC2(text).score,
    detectVarSelector(text).score,
    detectZeroWidthSteg(text).score,
    detectTokenSegBias(text).score,
  ];
  return Math.min(100, Math.round(r.reduce((a, b) => a + b, 0) / 8));
}

export function analyzeText(text: string, rawSource?: string): AnalysisResult {
  const normalized = nfkc(text);
  const tokens = tokenize(normalized);
  const rawTokens = tokenize(rawSource ?? text);

  const detectors: Record<AttackType, { score: number; reasons: string[] }> = {
    "Mixed Script": detectMixedScript(normalized),
    "Invisible Char": detectInvisible(normalized),
    "Grapheme Spoof": detectGraphemeSpoof(normalized),
    "Unicode Cat": detectUnicodeCategories(normalized),
    "Emoji C2 Cmd": detectEmojiC2(normalized),
    "Var Selector": detectVarSelector(normalized),
    "Zero-Width Steg": detectZeroWidthSteg(normalized),
    "Token Seg Bias": detectTokenSegBias(normalized),
  };

  // Map to methods matrix (heuristic contributions similar to reference image)
  const matrix: DetectionCell[] = [];
  const methodWeights: Record<DetectionMethod, (a: AttackType) => number> = {
    "NFKC Norm": (a) => (a === "Mixed Script" || a === "Zero-Width Steg" ? 75 : 60),
    "Grapheme Anal": (a) => (a === "Grapheme Spoof" || a === "Zero-Width Steg" ? 90 : 75),
    "Stat Pattern": (a) => (a === "Emoji C2 Cmd" ? 90 : 70),
    "ML Classify": () => 90,
    "Rule Filter": (a) => (a === "Unicode Cat" ? 95 : 80),
    "Token Anal": (a) => (a === "Token Seg Bias" ? 95 : 70),
    "Unicode Cat": (a) => (a === "Unicode Cat" ? 90 : 65),
    "Var Sel Det": (a) => (a === "Var Selector" ? 95 : 70),
  };

  for (const attack of ATTACKS) {
    for (const method of METHODS) {
      const contribute = methodWeights[method](attack);
      const base = detectors[attack].score;
      const score = Math.round((base * contribute) / 100);
      matrix.push({ attack, method, score });
    }
  }

  const overallRisk = Math.round(mlClassifyRisk(normalized));
  const alerts: string[] = [];
  for (const a of ATTACKS) {
    const s = detectors[a].score;
    if (s >= 70) alerts.push(`${a} risk high (${s})`);
  }

  // tokenization drift ratio (after/ before)
  const tokenDriftRatio = rawTokens.length ? Number((tokens.length / rawTokens.length).toFixed(3)) : 0;

  // Compute removed code points between rawSource and sanitized `text`
  const raw = Array.from(rawSource ?? text);
  const san = Array.from(text);
  const count = (arr: string[]) => arr.reduce<Record<string, number>>((m, ch) => { m[ch] = (m[ch] || 0) + 1; return m; }, {});
  const rawMap = count(raw);
  const sanMap = count(san);
  const removed: { cp: number; hex: string; char: string }[] = [];
  for (const ch of Object.keys(rawMap)) {
    const diff = rawMap[ch] - (sanMap[ch] || 0);
    if (diff > 0) {
      const cp = ch.codePointAt(0)!;
      const hex = "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
      for (let i = 0; i < diff; i++) removed.push({ cp, hex, char: ch });
    }
  }

  return {
    normalized,
    tokens,
    rawTokens,
    tokenDriftRatio,
    // include pre-normalization sanitized text (post-policy)
    sanitized: text,
    removed,
    matrix,
    summary: detectors,
    overallRisk,
    alerts,
  };
}

export const AttackList = ATTACKS;
export const MethodList = METHODS;