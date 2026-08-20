export interface PrintColor {
  code: string;
  hex: string;
  family: string;
  texture?: boolean;
}

export const PALETTE_FAMILIES = [
  { key: "S", label: "Schwarz / Grau" },
  { key: "W", label: "Weiß" },
  { key: "R", label: "Rot" },
  { key: "B", label: "Blau" },
  { key: "G", label: "Grün" },
  { key: "N", label: "Natur" },
  { key: "V", label: "Violett / Pink" },
] as const;

export const PRINT_PALETTE: PrintColor[] = [
  { code: "S.001B", hex: "#171a1f", family: "S" },
  { code: "S.002B", hex: "#23262b", family: "S" },
  { code: "S.003B", hex: "#3a3e45", family: "S" },
  { code: "S.004B", hex: "#4d5157", family: "S" },
  { code: "S.005B", hex: "#6b7078", family: "S" },
  { code: "S.006B", hex: "#8f949c", family: "S" },
  { code: "S.007B", hex: "#b5b9bf", family: "S" },
  { code: "S.008B", hex: "#d7dade", family: "S" },
  { code: "S.009B", hex: "#eef0f3", family: "S" },

  { code: "W.001B", hex: "#ffffff", family: "W", texture: true },
  { code: "W.002B", hex: "#f7f6f2", family: "W" },
  { code: "W.003B", hex: "#efece6", family: "W" },

  { code: "R.001B", hex: "#7f1d1d", family: "R" },
  { code: "R.002B", hex: "#991b1b", family: "R" },
  { code: "R.003B", hex: "#b91c1c", family: "R" },
  { code: "R.004B", hex: "#dc2626", family: "R", texture: true },
      { code: "R.007B", hex: "#c2410c", family: "R" },
  { code: "R.008B", hex: "#ea580c", family: "R", texture: true },
  { code: "R.009B", hex: "#f97316", family: "R" },
  { code: "R.010B", hex: "#f59e0b", family: "R" },
  { code: "R.011B", hex: "#fbbf24", family: "R" },
  { code: "R.012B", hex: "#fcd34d", family: "R" },

  { code: "B.001B", hex: "#172554", family: "B" },
  { code: "B.002B", hex: "#1e3a8a", family: "B" },
  { code: "B.003B", hex: "#1d4ed8", family: "B" },
  { code: "B.004B", hex: "#2563eb", family: "B", texture: true },
  { code: "B.005B", hex: "#3b82f6", family: "B" },
      { code: "B.008B", hex: "#0e7490", family: "B" },
  { code: "B.009B", hex: "#06b6d4", family: "B" },
  { code: "B.010B", hex: "#22d3ee", family: "B" },
  { code: "B.011B", hex: "#67e8f9", family: "B" },
  { code: "B.012B", hex: "#0f172a", family: "B" },

  { code: "G.001B", hex: "#14532d", family: "G" },
  { code: "G.002B", hex: "#166534", family: "G" },
  { code: "G.003B", hex: "#15803d", family: "G" },
  { code: "G.004B", hex: "#16a34a", family: "G", texture: true },
  { code: "G.005B", hex: "#22c55e", family: "G" },
  { code: "G.006B", hex: "#4ade80", family: "G" },
    { code: "G.008B", hex: "#4d7c0f", family: "G" },
  { code: "G.009B", hex: "#65a30d", family: "G" },
  { code: "G.010B", hex: "#84cc16", family: "G" },
  { code: "G.011B", hex: "#a3e635", family: "G" },

  { code: "N.001B", hex: "#5b4632", family: "N" },
  { code: "N.002B", hex: "#7c5e46", family: "N" },
  { code: "N.003B", hex: "#9a7b5c", family: "N" },
  { code: "N.004B", hex: "#b9956f", family: "N" },
  { code: "N.005B", hex: "#d3b58d", family: "N" },
  { code: "N.006B", hex: "#e6d3b4", family: "N" },
  { code: "N.007B", hex: "#f2e6d0", family: "N" },

  { code: "V.001B", hex: "#4c1d95", family: "V" },
  { code: "V.002B", hex: "#6d28d9", family: "V" },
  { code: "V.003B", hex: "#7c3aed", family: "V" },
  { code: "V.004B", hex: "#a855f7", family: "V" },
    { code: "V.006B", hex: "#be185d", family: "V" },
  { code: "V.007B", hex: "#db2777", family: "V" },
  { code: "V.008B", hex: "#ec4899", family: "V" },
  { code: "V.009B", hex: "#f472b6", family: "V" },
  { code: "V.010B", hex: "#fbcfe8", family: "V" },
];

export const TEXTURE_COUNT = PRINT_PALETTE.filter((c) => c.texture).length;

export function colorByCode(code: string): PrintColor | undefined {
  return PRINT_PALETTE.find((c) => c.code === code);
}

export function colorByHex(hex: string): PrintColor | undefined {
  const normalized = hex.toUpperCase();
  return PRINT_PALETTE.find((c) => c.hex.toUpperCase() === normalized);
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function nearestPaletteCode(hex: string): string {
  const exact = colorByHex(hex);
  if (exact) return exact.code;
  const [r, g, b] = rgbOf(hex);
  let best = PRINT_PALETTE[0];
  let bestDist = Infinity;
  for (const c of PRINT_PALETTE) {
    const [pr, pg, pb] = rgbOf(c.hex);
    const d = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best.code;
}