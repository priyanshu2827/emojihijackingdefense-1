"use client";
import { ResponsiveContainer } from "recharts";
import React from "react";
import type { DetectionCell, AttackType, DetectionMethod } from "@/lib/unicode/types";

// Lightweight heatmap renderer using Recharts' ResponsiveContainer for sizing
// We render our own SVG to ensure full control and avoid relying on experimental HeatMap

export interface DetectionMatrixProps {
  data: DetectionCell[];
  attacks: AttackType[];
  methods: DetectionMethod[];
}

function colorScale(score: number) {
  // 0 -> red, 50 -> yellow, 100 -> green
  const r = score < 50 ? 255 : Math.round(255 - (score - 50) * 5.1);
  const g = score < 50 ? Math.round(score * 5.1) : 255;
  const b = 120;
  return `rgb(${r},${g},${b})`;
}

export default function DetectionMatrix({ data, attacks, methods }: DetectionMatrixProps) {
  const matrix: Record<string, number> = {};
  for (const cell of data) matrix[`${cell.attack}__${cell.method}`] = cell.score;

  return (
    <div className="w-full h-[480px] rounded-xl border p-4 bg-card">
      <div className="text-center font-semibold mb-2">Unicode Attack Detection Matrix</div>
      <ResponsiveContainer width="100%" height="100%">
        {({ width, height }) => {
          const padding = 64;
          const w = Math.max(200, width - padding - 16);
          const h = Math.max(120, height - padding - 16);
          const cw = w / methods.length;
          const ch = h / attacks.length;
          return (
            <svg width={width} height={height} role="img" aria-label="Detection Matrix Heatmap">
              {/* Axis labels */}
              <g transform={`translate(64,16)`}>
                {/* columns */}
                {methods.map((m, j) => (
                  <text key={m} x={j * cw + cw / 2} y={-8} textAnchor="middle" className="fill-foreground text-[12px]">{m}</text>
                ))}
                {/* rows */}
                {attacks.map((a, i) => (
                  <text key={a} x={-8} y={i * ch + ch / 2} textAnchor="end" dominantBaseline="middle" className="fill-foreground text-[12px]">{a}</text>
                ))}

                {/* cells */}
                {attacks.map((a, i) => (
                  <g key={a}>
                    {methods.map((m, j) => {
                      const score = matrix[`${a}__${m}`] ?? 0;
                      const x = j * cw;
                      const y = i * ch;
                      return (
                        <g key={m}>
                          <rect x={x} y={y} width={cw - 4} height={ch - 4} rx={6} ry={6} fill={colorScale(score)} />
                          <text x={x + (cw - 4) / 2} y={y + (ch - 4) / 2} textAnchor="middle" dominantBaseline="central" className="text-[11px] fill-[white] font-medium">
                            {score}%
                          </text>
                        </g>
                      );
                    })}
                  </g>
                ))}
              </g>
            </svg>
          );
        }}
      </ResponsiveContainer>
    </div>
  );
}