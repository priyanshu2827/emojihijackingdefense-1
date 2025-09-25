export type AttackType =
  | "Mixed Script"
  | "Invisible Char"
  | "Grapheme Spoof"
  | "Unicode Cat"
  | "Emoji C2 Cmd"
  | "Var Selector"
  | "Zero-Width Steg"
  | "Token Seg Bias";

export type DetectionMethod =
  | "NFKC Norm"
  | "Grapheme Anal"
  | "Stat Pattern"
  | "ML Classify"
  | "Rule Filter"
  | "Token Anal"
  | "Unicode Cat"
  | "Var Sel Det";

export interface DetectionCell {
  attack: AttackType;
  method: DetectionMethod;
  score: number; // 0..100
}

export interface AnalysisResult {
  normalized: string;
  tokens: string[];
  // Added: pre-normalization tokens and drift ratio for visualization
  rawTokens?: string[];
  tokenDriftRatio?: number; // tokens_after / tokens_before
  // Added: sanitized text after policy (pre-normalization) for copy/export
  sanitized?: string;
  // Added: removed code points during sanitization for diff/annotation
  removed?: { cp: number; hex: string; char: string }[];
  matrix: DetectionCell[];
  summary: Record<AttackType, { score: number; reasons: string[] }>; // 0..100
  overallRisk: number; // 0..100
  alerts: string[];
}

export interface AnalyzeRequest {
  text: string;
  options?: {
    languageHint?: string;
    strict?: boolean;
    // Policy mode controls for sanitization behavior
    policyMode?: "Observe" | "Soft" | "Hard";
    removeVarSelectors?: boolean; // FE00–FE0F, E0100–E01EF
    removeTags?: boolean; // E0000–E007F (Unicode TAG characters)
  };
}