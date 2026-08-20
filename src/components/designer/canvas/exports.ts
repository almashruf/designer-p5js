import type { DesignObject, ProductConfig } from "../state/designerStore";
import { resolveFill } from "./designDrawing";
import { CM_TO_PX } from "../state/designerStore";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearestPaletteColor(
  r: number,
  g: number,
  b: number,
  palette: string[],
): string {
  let best = palette[0];
  let bestDist = Infinity;
  for (const hex of palette) {
    const [pr, pg, pb] = hexToRgb(hex);
    const d = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
    if (d < bestDist) {
      bestDist = d;
      best = hex;
    }
  }
  return best;
}

export function usedPalette(
  config: ProductConfig,
  objects: DesignObject[],
): string[] {
  const palette = new Set<string>();
  const base = resolveFill(config.baseColor);
  palette.add(base);
  if (config.edge) palette.add("#111827");
  for (const obj of objects) {
    if (obj.type === "image") continue;
    const fill = obj.printColor ?? obj.fill;
    if (fill) palette.add(resolveFill(fill));
    if (obj.textBg) palette.add(resolveFill(obj.textBg));
  }
  return Array.from(palette);
}

export function quantizedPng8(
  canvas: HTMLCanvasElement,
  palette: string[],
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  if (!ctx) return out;
  const source = canvas.getContext("2d");
  if (!source) return out;
  const imageData = source.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const hex = nearestPaletteColor(data[i], data[i + 1], data[i + 2], palette);
    const [r, g, b] = hexToRgb(hex);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
  return out;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadPng8(
  canvas: HTMLCanvasElement,
  config: ProductConfig,
  objects: DesignObject[],
) {
  const palette = usedPalette(config, objects);
  const out = quantizedPng8(canvas, palette);
  out.toBlob((blob) => {
    if (blob) downloadBlob(blob, `design-indexed-${Date.now()}.png`);
  }, "image/png");
}

function svgShape(obj: DesignObject, mmPerUnit: number): string {
  const x = obj.x * mmPerUnit;
  const y = obj.y * mmPerUnit;
  const w = obj.width * mmPerUnit;
  const h = obj.height * mmPerUnit;
  const fill = resolveFill(obj.printColor ?? obj.fill);
  const translate = `transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${((obj.rotation * 180) / Math.PI).toFixed(2)})"`;

  switch (obj.type) {
    case "rect":
      return `<rect x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}" ${translate}/>`;
    case "circle":
      return `<ellipse cx="0" cy="0" rx="${(w / 2).toFixed(2)}" ry="${(h / 2).toFixed(2)}" fill="${fill}" ${translate}/>`;
    case "star": {
      const r = Math.min(w, h) / 2;
      const points: string[] = [];
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? r : r * 0.45;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        points.push(`${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`);
      }
      return `<polygon points="${points.join(" ")}" fill="${fill}" ${translate}/>`;
    }
    case "triangle":
      return `<polygon points="${(-w / 2).toFixed(2)},${(h / 2).toFixed(2)} ${(w / 2).toFixed(2)},${(h / 2).toFixed(2)} 0,${(-h / 2).toFixed(2)}" fill="${fill}" ${translate}/>`;
    case "heart":
      return `<path d="M0 ${(h * 0.32).toFixed(2)} C ${(w * 0.5).toFixed(2)} ${(-h * 0.1).toFixed(2)}, ${(w * 0.35).toFixed(2)} ${(-h * 0.45).toFixed(2)}, 0 ${(-h * 0.18).toFixed(2)} C ${(-w * 0.35).toFixed(2)} ${(-h * 0.45).toFixed(2)}, ${(-w * 0.5).toFixed(2)} ${(-h * 0.1).toFixed(2)}, 0 ${(h * 0.32).toFixed(2)} Z" fill="${fill}" ${translate}/>`;
    case "bolt":
      return `<polygon points="${(w * 0.12).toFixed(2)},${(-h * 0.5).toFixed(2)} ${(-w * 0.3).toFixed(2)},${(h * 0.06).toFixed(2)} ${(-w * 0.05).toFixed(2)},${(h * 0.06).toFixed(2)} ${(-w * 0.12).toFixed(2)},${(h * 0.5).toFixed(2)} ${(w * 0.3).toFixed(2)},${(-h * 0.06).toFixed(2)} ${(w * 0.05).toFixed(2)},${(-h * 0.06).toFixed(2)}" fill="${fill}" ${translate}/>`;
    case "moon":
      return `<path d="M ${(w * 0.3).toFixed(2)} ${(-h * 0.44).toFixed(2)} C ${(-w * 0.5).toFixed(2)} ${(-h * 0.2).toFixed(2)}, ${(-w * 0.4).toFixed(2)} ${(h * 0.34).toFixed(2)}, ${(w * 0.18).toFixed(2)} ${(h * 0.42).toFixed(2)} C ${(-w * 0.14).toFixed(2)} ${(h * 0.14).toFixed(2)}, ${(-w * 0.06).toFixed(2)} ${(-h * 0.08).toFixed(2)}, ${(w * 0.3).toFixed(2)} ${(-h * 0.44).toFixed(2)} Z" fill="${fill}" ${translate}/>`;
    case "arrow":
      return `<polygon points="${(-w * 0.2).toFixed(2)},${(-h * 0.5).toFixed(2)} ${(w * 0.3).toFixed(2)},0 ${(-w * 0.2).toFixed(2)},${(h * 0.5).toFixed(2)} ${(-w * 0.05).toFixed(2)},0" fill="${fill}" ${translate}/>`;
    case "cross": {
      const t = 0.3;
      return `<path d="M ${(-w * 0.5).toFixed(2)} ${(-h * t).toFixed(2)} H ${(-w * t).toFixed(2)} V ${(-h * 0.5).toFixed(2)} H ${(w * t).toFixed(2)} V ${(-h * t).toFixed(2)} H ${(w * 0.5).toFixed(2)} V ${(h * t).toFixed(2)} H ${(w * t).toFixed(2)} V ${(h * 0.5).toFixed(2)} H ${(-w * t).toFixed(2)} V ${(h * t).toFixed(2)} H ${(-w * 0.5).toFixed(2)} Z" fill="${fill}" ${translate}/>`;
    }
    case "text": {
      const fontSize = Math.max(6, h);
      const family = obj.fontFamily ?? "Arial";
      const fontWeight = obj.bold ? "bold" : "normal";
      const fontStyle = obj.italic ? "italic" : "normal";
      const anchor = obj.align === "left" ? "start" : obj.align === "right" ? "end" : "middle";
      const textDecoration = obj.underline ? "underline" : "none";
      let text = `<text x="0" y="${(fontSize * 0.35).toFixed(2)}" font-family="${family}" font-size="${fontSize.toFixed(2)}" font-weight="${fontWeight}" font-style="${fontStyle}" text-anchor="${anchor}" text-decoration="${textDecoration}" fill="${fill}" ${translate}>${escapeXml(obj.text ?? "Text")}</text>`;
      if (obj.textBg) {
        const bg = resolveFill(obj.textBg);
        const width = (obj.text?.length ?? 4) * fontSize * 0.6;
        text = `<rect x="${(-width / 2).toFixed(2)}" y="${(-fontSize / 2).toFixed(2)}" width="${width.toFixed(2)}" height="${fontSize.toFixed(2)}" fill="${bg}" ${translate}/>` + text;
      }
      return text;
    }
    case "line":
      return `<line x1="${(-w / 2).toFixed(2)}" y1="0" x2="${(w / 2).toFixed(2)}" y2="0" stroke="${fill}" stroke-width="${Math.max(2, h).toFixed(2)}" ${translate}/>`;
    case "image":
      if (obj.imageData) {
        return `<image x="${(-w / 2).toFixed(2)}" y="${(-h / 2).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" href="${obj.imageData}" ${translate}/>`;
      }
      return "";
    default:
      return "";
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSvg(
  config: ProductConfig,
  objects: DesignObject[],
): string {
  const mmW = config.widthCm * CM_TO_PX;
  const mmH = config.heightCm * CM_TO_PX;
  const baseHex = resolveFill(config.baseColor);
  const clipId = `clip-${Date.now()}`;
  const clip =
    config.form === "rund"
      ? `<clipPath id="${clipId}"><ellipse cx="${(mmW / 2).toFixed(2)}" cy="${(mmH / 2).toFixed(2)}" rx="${(mmW / 2).toFixed(2)}" ry="${(mmH / 2).toFixed(2)}"/></clipPath>`
      : `<clipPath id="${clipId}"><rect x="0" y="0" width="${mmW.toFixed(2)}" height="${mmH.toFixed(2)}"/></clipPath>`;

  const shapes = objects
    .map((o) => svgShape(o, 1))
    .filter((s) => s.length > 0)
    .join("\n  ");

  const border =
    config.edge && config.form !== "rund"
      ? `<rect x="0" y="0" width="${mmW.toFixed(2)}" height="${mmH.toFixed(2)}" fill="none" stroke="#111827" stroke-width="2"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${mmW.toFixed(2)}" height="${mmH.toFixed(2)}" viewBox="0 0 ${mmW.toFixed(2)} ${mmH.toFixed(2)}">
  <defs>${clip}</defs>
  ${
    config.form === "rund"
      ? `<ellipse cx="${(mmW / 2).toFixed(2)}" cy="${(mmH / 2).toFixed(2)}" rx="${(mmW / 2).toFixed(2)}" ry="${(mmH / 2).toFixed(2)}" fill="${baseHex}"/>`
      : `<rect width="${mmW.toFixed(2)}" height="${mmH.toFixed(2)}" fill="${baseHex}"/>`
  }
  ${border}
  <g clip-path="url(#${clipId})">
  ${shapes}
  </g>
</svg>`;
}

export function downloadSvg(config: ProductConfig, objects: DesignObject[]) {
  const svg = buildSvg(config, objects);
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `design-${Date.now()}.svg`);
}

export function downloadProof(
  canvas: HTMLCanvasElement,
  config: ProductConfig,
) {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(canvas, 0, 0);
  const w = out.width;
  const h = out.height;

  ctx.save();
  ctx.fillStyle = "rgba(243, 241, 236, 0.82)";
  ctx.fillRect(0, 0, w, h);

  const stripeH = Math.max(40, h * 0.14);
  ctx.fillStyle = "#171a1f";
  ctx.fillRect(0, 0, w, stripeH);
  ctx.fillRect(0, h - stripeH, w, stripeH);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.max(18, stripeH * 0.22)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PROBEABZUG", w / 2, stripeH / 2);
  ctx.fillText("PROOF SHEET", w / 2, h - stripeH / 2);

  ctx.fillStyle = "#171a1f";
  ctx.font = `${Math.max(13, stripeH * 0.16)}px monospace`;
  const lines = [
    `${config.widthCm} × ${config.heightCm} cm`,
    config.form === "rund" ? "Rund" : "Eckig",
    `Art.-Nr. ${Date.now()}`,
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (stripeH * 0.24));
  });

  ctx.strokeStyle = "#171a1f";
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.restore();

  out.toBlob((blob) => {
    if (blob) downloadBlob(blob, `probeabzug-${Date.now()}.png`);
  }, "image/png");
}