import type { DesignObject, ProductConfig } from "./state/designerStore";
import { resolveFill } from "./canvas/designDrawing";

export interface QualityWarning {
  id: string;
  severity: "error" | "warn";
  message: string;
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function runPrintChecks(
  config: ProductConfig,
  objects: DesignObject[],
): QualityWarning[] {
  const warnings: QualityWarning[] = [];
  const baseHex = resolveFill(config.baseColor);
  const mm = 1;

  objects.forEach((obj, i) => {
    const id = obj.id;
    const fillHex = resolveFill(obj.printColor ?? obj.fill);

    if (contrastRatio(fillHex, baseHex) < 1.7) {
      warnings.push({
        id: `${id}-contrast`,
        severity: "warn",
        message: `Element ${i + 1}: contrast ${contrastRatio(fillHex, baseHex).toFixed(2)}:1 vs base — below 1.7:1`,
      });
    }

    const minDim = Math.min(obj.width, obj.height) * mm;
    const maxDim = Math.max(obj.width, obj.height) * mm;

    if (obj.type === "text") {
      const inkMm = obj.height * mm;
      if (inkMm < 30) {
        warnings.push({
          id: `${id}-text-ink`,
          severity: "error",
          message: `Text ${i + 1}: ink height ${Math.round(inkMm)}mm — min 30mm`,
        });
      }
    } else if (obj.type === "image" || ["star", "circle", "triangle", "heart", "bolt", "moon", "arrow", "cross"].includes(obj.type)) {
      if (minDim < 30 || maxDim < 10) {
        warnings.push({
          id: `${id}-icon-size`,
          severity: "warn",
          message: `Icon ${i + 1}: ${Math.round(minDim)}×${Math.round(maxDim)}mm — min 30×10mm`,
        });
      }
    } else if (obj.type === "line") {
      const thickness = obj.height * mm;
      const darkOnLight = contrastRatio(fillHex, baseHex) >= 1.7;
      if (darkOnLight && thickness < 16) {
        warnings.push({
          id: `${id}-line-thick`,
          severity: "warn",
          message: `Line ${i + 1}: ${Math.round(thickness)}mm thick — min 16mm dark-on-light`,
        });
      }
      if (!darkOnLight && thickness < 20) {
        warnings.push({
          id: `${id}-line-thick-light`,
          severity: "warn",
          message: `Line ${i + 1}: ${Math.round(thickness)}mm thick — min 20mm light-on-dark`,
        });
      }
    }
  });

  objects.forEach((obj, i) => {
    const edgeMargin = Math.min(
      Math.abs(obj.x) - obj.width / 2 + config.widthCm * 5,
      Math.abs(obj.y) - obj.height / 2 + config.heightCm * 5,
    );
    if (edgeMargin < 10) {
      warnings.push({
        id: `${obj.id}-edge`,
        severity: "warn",
        message: `Element ${i + 1}: ${Math.round(edgeMargin)}mm from edge — min 10mm`,
      });
    }
  });

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i];
      const b = objects[j];
      const gap = Math.min(
        Math.abs(a.x - b.x) - (a.width + b.width) / 2,
        Math.abs(a.y - b.y) - (a.height + b.height) / 2,
      );
      if (gap < 6) {
        warnings.push({
          id: `${a.id}-${b.id}-spacing`,
          severity: "warn",
          message: `Elements ${i + 1} & ${j + 1}: spacing ${Math.round(gap)}mm — min 6mm`,
        });
      }
    }
  }

  return warnings;
}