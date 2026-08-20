import type p5 from "p5";
import type { DesignObject, ProductConfig } from "../state/designerStore";
import { colorByCode } from "../printPalette";
import { SAFE_AREA_MM } from "../state/designerStore";

export interface ProductGeometry {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export function resolveFill(fill: string): string {
  if (fill.startsWith("#")) return fill;
  return colorByCode(fill)?.hex ?? "#000000";
}

export function computeGeometry(
  canvasW: number,
  canvasH: number,
  config: ProductConfig,
): ProductGeometry {
  const marginLeft = 68;
  const marginRight = 26;
  const marginTop = 82;
  const marginBottom = 34;
  const availableW = Math.max(1, canvasW - marginLeft - marginRight);
  const availableH = Math.max(1, canvasH - marginTop - marginBottom);
  const aspect = config.widthCm / config.heightCm;
  const width = Math.min(availableW, availableH * aspect);
  const height = width / aspect;
  return {
    centerX: canvasW / 2 + (marginLeft - marginRight) / 2,
    centerY: canvasH / 2,
    width,
    height,
  };
}

export function cornerRadius(g: ProductGeometry, config: ProductConfig): number {
  return config.form === "eckig"
    ? Math.min(24, Math.max(8, g.height * 0.06))
    : 0;
}

export function drawProduct(p: p5, g: ProductGeometry, config: ProductConfig) {
  const baseHex = resolveFill(config.baseColor);
  p.push();
  if (config.form === "rund") {
    p.noStroke();
    p.fill(baseHex);
    p.ellipse(g.centerX, g.centerY, g.width, g.height);
    if (config.edge) {
      p.noFill();
      p.stroke("#111827");
      p.strokeWeight(2);
      p.ellipse(g.centerX, g.centerY, g.width, g.height);
    }
  } else {
    const r = cornerRadius(g, config);
    p.noStroke();
    p.fill(baseHex);
    p.rect(g.centerX, g.centerY, g.width, g.height, r, r, r, r);
    if (config.edge) {
      p.noFill();
      p.stroke("#111827");
      p.strokeWeight(2);
      p.rect(g.centerX, g.centerY, g.width, g.height, r, r, r, r);
    }
  }
  p.pop();
}

export function drawDashedBoundary(
  p: p5,
  g: ProductGeometry,
  config: ProductConfig,
) {
  const mmPerPx = g.width / Math.max(1, config.widthCm * 10);
  const inset = SAFE_AREA_MM * mmPerPx;
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.save();
  ctx.setLineDash([6, 5]);
  p.noFill();
  p.stroke("#c9cdd2");
  p.strokeWeight(1.5);
  if (config.form === "rund") {
    p.ellipse(
      g.centerX,
      g.centerY,
      g.width - inset * 2,
      g.height - inset * 2,
    );
  } else {
    p.rect(g.centerX, g.centerY, g.width - inset * 2, g.height - inset * 2);
  }
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawStar(
  p: p5,
  cx: number,
  cy: number,
  radius: number,
) {
  p.beginShape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    p.vertex(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  p.endShape(p.CLOSE);
}

export function drawHeart(p: p5, cx: number, cy: number, w: number, h: number) {
  p.noStroke();
  p.ellipse(cx - w * 0.27, cy - h * 0.16, w * 0.58, h * 0.58);
  p.ellipse(cx + w * 0.27, cy - h * 0.16, w * 0.58, h * 0.58);
  p.triangle(cx - w * 0.55, cy + 0.02 * h, cx + w * 0.55, cy + 0.02 * h, cx, cy + h * 0.58);
}

export function drawBolt(p: p5, cx: number, cy: number, w: number, h: number) {
  p.beginShape();
  p.vertex(cx + w * 0.12, cy - h * 0.5);
  p.vertex(cx - w * 0.3, cy + h * 0.06);
  p.vertex(cx - w * 0.05, cy + h * 0.06);
  p.vertex(cx - w * 0.12, cy + h * 0.5);
  p.vertex(cx + w * 0.3, cy - h * 0.06);
  p.vertex(cx + w * 0.05, cy - h * 0.06);
  p.endShape(p.CLOSE);
}

export function drawMoon(p: p5, cx: number, cy: number, w: number, h: number) {
  const R = Math.min(w, h) / 2;
  p.beginShape();
  for (let a = Math.PI / 2; a <= (3 * Math.PI) / 2 + 0.001; a += Math.PI / 10) {
    p.vertex(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
  }
  for (let a = (3 * Math.PI) / 2; a <= Math.PI / 2 + 2 * Math.PI + 0.001; a += Math.PI / 10) {
    p.vertex(cx + R * 0.55 + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72);
  }
  p.endShape(p.CLOSE);
}

export function drawArrow(p: p5, cx: number, cy: number, w: number, h: number) {
  p.beginShape();
  p.vertex(cx - w * 0.2, cy - h * 0.5);
  p.vertex(cx + w * 0.3, cy);
  p.vertex(cx - w * 0.2, cy + h * 0.5);
  p.vertex(cx - w * 0.05, cy);
  p.endShape(p.CLOSE);
}

export function drawCross(p: p5, cx: number, cy: number, w: number, h: number) {
  p.beginShape();
  const t = 0.3;
  p.vertex(cx - w * 0.5, cy - h * t);
  p.vertex(cx - w * t, cy - h * t);
  p.vertex(cx - w * t, cy - h * 0.5);
  p.vertex(cx + w * t, cy - h * 0.5);
  p.vertex(cx + w * t, cy - h * t);
  p.vertex(cx + w * 0.5, cy - h * t);
  p.vertex(cx + w * 0.5, cy + h * t);
  p.vertex(cx + w * t, cy + h * t);
  p.vertex(cx + w * t, cy + h * 0.5);
  p.vertex(cx - w * t, cy + h * 0.5);
  p.vertex(cx - w * t, cy + h * t);
  p.vertex(cx - w * 0.5, cy + h * t);
  p.endShape(p.CLOSE);
}

export class P5ImageLoader {
  private cache = new Map<string, p5.Image>();

  constructor(private p: p5) {}

  get(dataUrl: string): p5.Image | undefined {
    return this.cache.get(dataUrl);
  }

  ensure(dataUrl: string, onLoaded?: () => void): p5.Image | undefined {
    const cached = this.cache.get(dataUrl);
    if (cached) return cached;
    this.p.loadImage(dataUrl, (img) => {
      this.cache.set(dataUrl, img);
      onLoaded?.();
    });
    return undefined;
  }
}

export interface ObjectDrawTransform {
  centerX: number;
  centerY: number;
  scale: number;
}

export function drawObjects(
  p: p5,
  objects: DesignObject[],
  transform: ObjectDrawTransform,
  loader: P5ImageLoader,
  onImageLoaded?: () => void,
) {
  for (const obj of objects) {
    if (obj.visible === false) continue;
    const x = transform.centerX + obj.x * transform.scale;
    const y = transform.centerY + obj.y * transform.scale;
    const w = obj.width * transform.scale;
    const h = obj.height * transform.scale;

    p.push();
    p.translate(x, y);
    p.rotate(obj.rotation);

    switch (obj.type) {
      case "rect":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        p.rect(0, 0, w, h);
        break;
      case "circle":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        p.ellipse(0, 0, w, h);
        break;
      case "star":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawStar(p, 0, 0, Math.min(w, h) / 2);
        break;
      case "triangle":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        p.triangle(-w / 2, h / 2, w / 2, h / 2, 0, -h / 2);
        break;
      case "heart":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawHeart(p, 0, 0, w, h);
        break;
      case "bolt":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawBolt(p, 0, 0, w, h);
        break;
      case "moon":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawMoon(p, 0, 0, w, h);
        break;
      case "arrow":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawArrow(p, 0, 0, w, h);
        break;
      case "cross":
        p.noStroke();
        p.fill(resolveFill(obj.fill));
        drawCross(p, 0, 0, w, h);
        break;
      case "text": {
        const fontSize = Math.max(6, h);
        const align = obj.align ?? "center";
        p.textAlign(
          align === "left" ? p.LEFT : align === "right" ? p.RIGHT : p.CENTER,
          p.CENTER,
        );
        p.textFont(obj.fontFamily ?? "'Geist Sans', Arial, sans-serif");
        if (obj.bold && obj.italic) p.textStyle(p.BOLDITALIC);
        else if (obj.bold) p.textStyle(p.BOLD);
        else if (obj.italic) p.textStyle(p.ITALIC);
        else p.textStyle(p.NORMAL);
        p.textSize(fontSize);
        p.noStroke();
        if (obj.textBg) {
          const bgHex = resolveFill(obj.textBg);
          const metrics = p.textWidth(obj.text ?? "");
          const pad = 6;
          p.fill(bgHex);
          p.rect(
            align === "left"
              ? metrics / 2 + pad / 2
              : align === "right"
                ? -metrics / 2 - pad / 2
                : 0,
            0,
            metrics + pad,
            fontSize + pad,
          );
        }
        p.fill(resolveFill(obj.fill));
        if (obj.underline) {
          const metrics = p.textWidth(obj.text ?? "");
          p.stroke(resolveFill(obj.fill));
          p.strokeWeight(Math.max(1.5, fontSize * 0.06));
          p.line(
            align === "right" ? -metrics : align === "center" ? -metrics / 2 : 0,
            fontSize / 2 + 3,
            align === "left" ? metrics : align === "center" ? metrics / 2 : 0,
            fontSize / 2 + 3,
          );
        }
        p.text(obj.text ?? "Text", 0, 0);
        break;
      }
      case "line":
        p.stroke(resolveFill(obj.fill));
        p.strokeWeight(Math.max(2, h));
        p.line(-w / 2, 0, w / 2, 0);
        break;
      case "image": {
        if (obj.imageData) {
          const img = loader.get(obj.imageData);
          if (img) {
            p.image(img, -w / 2, -h / 2, w, h);
          } else {
            loader.ensure(obj.imageData, onImageLoaded);
          }
        }
        break;
      }
    }
    p.pop();
  }
}

export function clipToProduct(p: p5, g: ProductGeometry, config: ProductConfig) {
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.beginPath();
  if (config.form === "rund") {
    ctx.ellipse(g.centerX, g.centerY, g.width / 2, g.height / 2, 0, 0, Math.PI * 2);
  } else {
    const r = cornerRadius(g, config);
    ctx.roundRect(
      g.centerX - g.width / 2,
      g.centerY - g.height / 2,
      g.width,
      g.height,
      r,
    );
  }
  ctx.clip();
}