import type p5 from "p5";

export interface ProductGeometry {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export const MEASUREMENT_STYLE = {
  line: "#16a34a",
  labelText: "#15803d",
  labelFill: "#dcfce7",
  tick: 5,
  gap: 30,
};

function measurePill(p: p5, label: string) {
  const pillWidth = p.textWidth(label) + 14;
  const pillHeight = 20;
  return { pillWidth, pillHeight };
}

function drawMeasurementLabel(
  p: p5,
  label: string,
  cx: number,
  cy: number,
  clamp: { minX: number; maxX: number; minY: number; maxY: number },
) {
  const { pillWidth, pillHeight } = measurePill(p, label);
  const x = Math.min(clamp.maxX, Math.max(clamp.minX, cx));
  const y = Math.min(clamp.maxY, Math.max(clamp.minY, cy));

  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(11);
  p.textStyle(p.BOLD);
  p.textFont("'Geist Sans', Arial, sans-serif");
  p.noStroke();
  p.fill(MEASUREMENT_STYLE.labelFill);
  p.rect(x, y, pillWidth, pillHeight, 10, 10, 10, 10);
  p.fill(MEASUREMENT_STYLE.labelText);
  p.text(label, x, y + 0.5);
  p.pop();
}

export function drawMeasurementLines(
  p: p5,
  g: ProductGeometry,
  widthCm: number,
  heightCm: number,
) {
  const { centerX, centerY, width, height } = g;
  const top = centerY - height / 2;
  const bottom = centerY + height / 2;
  const left = centerX - width / 2;
  const right = centerX + width / 2;

  const topLineY = top - MEASUREMENT_STYLE.gap;
  const leftLineX = left - MEASUREMENT_STYLE.gap;

  p.push();
  p.stroke(MEASUREMENT_STYLE.line);
  p.strokeWeight(1.5);

  p.line(left, topLineY, right, topLineY);
  p.line(left, topLineY - MEASUREMENT_STYLE.tick, left, topLineY + MEASUREMENT_STYLE.tick);
  p.line(right, topLineY - MEASUREMENT_STYLE.tick, right, topLineY + MEASUREMENT_STYLE.tick);

  p.line(leftLineX, top, leftLineX, bottom);
  p.line(leftLineX - MEASUREMENT_STYLE.tick, top, leftLineX + MEASUREMENT_STYLE.tick, top);
  p.line(leftLineX - MEASUREMENT_STYLE.tick, bottom, leftLineX + MEASUREMENT_STYLE.tick, bottom);

  p.pop();

  const widthLabel = `${widthCm.toFixed(2)} cm`;
  const heightLabel = `${heightCm.toFixed(2)} cm`;
  const { pillWidth: hPillWidth, pillHeight: hPillHeight } = measurePill(p, heightLabel);

  drawMeasurementLabel(p, widthLabel, centerX, topLineY - 18, {
    minX: 8 + p.textWidth(widthLabel) / 2 + 7,
    maxX: p.width - 8 - p.textWidth(widthLabel) / 2 - 7,
    minY: 6 + 10,
    maxY: p.height - 6 - 10,
  });
  drawMeasurementLabel(p, heightLabel, leftLineX - 18, centerY, {
    minX: 8 + hPillWidth / 2,
    maxX: p.width - 8 - hPillWidth / 2,
    minY: 6 + hPillHeight / 2,
    maxY: p.height - 6 - hPillHeight / 2,
  });
}
