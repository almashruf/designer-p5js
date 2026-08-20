"use client";

import { useEffect, useRef } from "react";
import p5 from "p5";
import type { DesignObject, ProductConfig } from "../state/designerStore";
import {
  P5ImageLoader,
  computeGeometry,
  drawDashedBoundary,
  drawObjects,
  drawProduct,
  clipToProduct,
} from "../canvas/designDrawing";
import { viewport } from "../canvas/viewport";

interface PreviewCanvasProps {
  config: ProductConfig;
  objects: DesignObject[];
}

export default function PreviewCanvas({ config, objects }: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const configRef = useRef<ProductConfig>(config);
  const objectsRef = useRef<DesignObject[]>(objects);

  useEffect(() => {
    configRef.current = config;
    objectsRef.current = objects;
    p5InstanceRef.current?.redraw();
  }, [config, objects]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let loader: P5ImageLoader | null = null;

    const sketch = (p: p5) => {
      p.setup = () => {
        const width = container.clientWidth || 240;
        const height = container.clientHeight || 200;
        p.createCanvas(width, height);
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.rectMode(p.CENTER);
        p.textFont("'Geist Sans', Arial, sans-serif");
        p.noLoop();
        loader = new P5ImageLoader(p);
      };

      p.draw = () => {
        const W = p.width;
        const H = p.height;
        const cfg = configRef.current;
        const g = computeGeometry(W, H, cfg);

        for (let y = 0; y < H; y += 16) {
          for (let x = 0; x < W; x += 16) {
            p.noStroke();
            p.fill((x / 16 + y / 16) % 2 === 0 ? "#ffffff" : "#e8eaed");
            p.rect(x + 8, y + 8, 16, 16);
          }
        }

        drawProduct(p, g, cfg);
        drawDashedBoundary(p, g, cfg);

        const k = W / Math.max(1, viewport.width);
        p.push();
        clipToProduct(p, g, cfg);
        drawObjects(
          p,
          objectsRef.current,
          { centerX: g.centerX, centerY: g.centerY, scale: k },
          loader!,
          () => p.redraw(),
        );
        p.pop();
      };

      p.windowResized = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
          p.resizeCanvas(width, height);
          p.redraw();
        }
      };
    };

    const instance = new p5(sketch, container);
    p5InstanceRef.current = instance;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && instance) {
          instance.resizeCanvas(width, height);
          instance.redraw();
        }
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (instance) instance.remove();
      container.querySelectorAll("canvas").forEach((el) => el.remove());
      p5InstanceRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}