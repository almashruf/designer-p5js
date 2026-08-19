import type p5 from "p5";
import type { DesignObject, ProductConfig } from "../state/designerStore";

export interface ProductGeometry {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
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
  return config.form === "around"
    ? Math.min(24, Math.max(8, g.height * 0.06))
    : 0;
}

export function drawProduct(p: p5, g: ProductGeometry, config: ProductConfig) {
  const r = cornerRadius(g, config);
  p.push();
  p.noStroke();
  p.fill(config.baseColor);
  p.rect(g.centerX, g.centerY, g.width, g.height, r, r, r, r);
  if (config.edge) {
    p.noFill();
    p.stroke("#111827");
    p.strokeWeight(2);
    p.rect(g.centerX, g.centerY, g.width, g.height, r, r, r, r);
  }
  p.pop();
}

export function drawDashedBoundary(p: p5, g: ProductGeometry) {
  const inset = 14;
  const ctx = p.drawingContext as CanvasRenderingContext2D;
  ctx.save();
  ctx.setLineDash([6, 5]);
  p.noFill();
  p.stroke("#c9cdd2");
  p.strokeWeight(1.5);
  p.rect(g.centerX, g.centerY, g.width - inset * 2, g.height - inset * 2);
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
        p.fill(obj.fill);
        p.rect(0, 0, w, h);
        break;
      case "circle":
        p.noStroke();
        p.fill(obj.fill);
        p.ellipse(0, 0, w, h);
        break;
      case "star":
        p.noStroke();
        p.fill(obj.fill);
        drawStar(p, 0, 0, Math.min(w, h) / 2);
        break;
      case "triangle":
        p.noStroke();
        p.fill(obj.fill);
        p.triangle(-w / 2, h / 2, w / 2, h / 2, 0, -h / 2);
        break;
      case "text":
        p.noStroke();
        p.fill(obj.fill);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(Math.max(8, h));
        p.textFont("'Geist Sans', Arial, sans-serif");
        p.text(obj.text ?? "Text", 0, 0);
        break;
      case "line":
        p.stroke(obj.fill);
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