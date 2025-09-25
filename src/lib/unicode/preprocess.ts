/* Preprocessing utilities: normalization, segmentation, tokenization */

export function nfkc(input: string): string {
  try {
    return input.normalize("NFKC");
  } catch {
    return input; // environments without full ICU
  }
}

export function tokenize(input: string): string[] {
  // Basic word-ish tokenization preserving emoji and symbols
  const re = /([\p{L}\p{N}\p{Emoji_Presentation}]+|\p{P}+|\s+)/gu;
  return Array.from(input.matchAll(re)).map((m) => m[0]).filter(Boolean);
}

export function graphemeClusters(input: string): string[] {
  try {
    const seg = new (Intl as any).Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(input), (s: any) => s.segment);
  } catch {
    // Fallback naive split
    return Array.from(input);
  }
}

export function codePoints(str: string): number[] {
  const cps: number[] = [];
  for (const ch of str) cps.push(ch.codePointAt(0)!);
  return cps;
}