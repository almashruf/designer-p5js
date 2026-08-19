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
} from "./designDrawing";
import { drawMeasurementLines } from "./MeasurementLines";
import { updateViewport } from "./viewport";
import { registerCapture, unregisterCapture } from "./canvasRegistry";

const COLORS = {
  productBorder: "#111827",
  dash: "#c9cdd2",
  statusText: "#6b7280",
  statusBorder: "#e3e5e8",
  selection: "#2563eb",
};

interface P5CanvasProps {
  config: ProductConfig;
  objects: DesignObject[];
  onObjectsChange: (objects: DesignObject[]) => void;
}

type InteractionMode = "none" | "drag" | "resize" | "rotate";

export default function P5Canvas({
  config,
  objects,
  onObjectsChange,
}: P5CanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);
  const configRef = useRef<ProductConfig>(config);
  const objectsRef = useRef<DesignObject[]>([]);
  const selectionRef = useRef<string | null>(null);
  const loaderRef = useRef<P5ImageLoader | null>(null);
  const onObjectsChangeRef = useRef(onObjectsChange);
  const interactionRef = useRef<{
    mode: InteractionMode;
    offsetX: number;
    offsetY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
  }>({
    mode: "none",
    offsetX: 0,
    offsetY: 0,
    startWidth: 0,
    startHeight: 0,
    startRotation: 0,
  });
  const geometryRef = useRef({ centerX: 0, centerY: 0 });

  useEffect(() => {
    onObjectsChangeRef.current = onObjectsChange;
  }, [onObjectsChange]);

  useEffect(() => {
    configRef.current = config;
    p5InstanceRef.current?.redraw();
  }, [config]);

  useEffect(() => {
    objectsRef.current = objects.map((o) => ({ ...o }));
    p5InstanceRef.current?.redraw();
  }, [objects]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sketch = (p: p5) => {
      const toWorld = (mx: number, my: number) => {
        const W = p.width;
        const H = p.height;
        const zoom = configRef.current.zoom;
        return {
          x: (mx - W / 2) / zoom + W / 2,
          y: (my - H / 2) / zoom + H / 2,
        };
      };

      const getSelected = (): DesignObject | null =>
        objectsRef.current.find((o) => o.id === selectionRef.current) ?? null;

      const worldOf = (obj: DesignObject) => ({
        x: geometryRef.current.centerX + obj.x,
        y: geometryRef.current.centerY + obj.y,
      });

      const hitTestObject = (wx: number, wy: number): DesignObject | null => {
        for (let i = objectsRef.current.length - 1; i >= 0; i--) {
          const obj = objectsRef.current[i];
          const pos = worldOf(obj);
          const dx = wx - pos.x;
          const dy = wy - pos.y;
          const cos = Math.cos(-obj.rotation);
          const sin = Math.sin(-obj.rotation);
          const lx = dx * cos - dy * sin;
          const ly = dx * sin + dy * cos;
          let inside: boolean;
          if (obj.type === "circle" || obj.type === "star") {
            const r = Math.min(obj.width, obj.height) / 2;
            inside = Math.hypot(lx, ly) <= r;
          } else {
            inside = Math.abs(lx) <= obj.width / 2 && Math.abs(ly) <= obj.height / 2;
          }
          if (inside) return obj;
        }
        return null;
      };

      const handlePositions = (obj: DesignObject) => {
        const pos = worldOf(obj);
        const cL = { x: obj.width / 2 + 4, y: obj.height / 2 + 4 };
        const rL = { x: 0, y: -obj.height / 2 - 36 };
        const cos = Math.cos(obj.rotation);
        const sin = Math.sin(obj.rotation);
        return {
          corner: {
            x: pos.x + cL.x * cos - cL.y * sin,
            y: pos.y + cL.x * sin + cL.y * cos,
          },
          rotate: {
            x: pos.x + rL.x * cos - rL.y * sin,
            y: pos.y + rL.x * sin + rL.y * cos,
          },
        };
      };

      const dist = (x1: number, y1: number, x2: number, y2: number) =>
        Math.hypot(x2 - x1, y2 - y1);

      const drawSelection = (obj: DesignObject) => {
        const pos = worldOf(obj);
        p.push();
        p.translate(pos.x, pos.y);
        p.rotate(obj.rotation);
        p.noFill();
        p.stroke(COLORS.selection);
        p.strokeWeight(1.5);
        p.rect(0, 0, obj.width + 8, obj.height + 8);
        p.fill(255);
        p.strokeWeight(2);
        p.rect(obj.width / 2 + 4, obj.height / 2 + 4, 10, 10);
        p.stroke(COLORS.selection);
        p.strokeWeight(1.5);
        p.line(0, -obj.height / 2 - 4, 0, -obj.height / 2 - 36);
        p.fill(255);
        p.circle(0, -obj.height / 2 - 36, 12);
        p.pop();
      };

      const drawNoElementsBox = () => {
        if (objectsRef.current.length > 0) return;
        const boxWidth = 104;
        const boxHeight = 30;
        const boxX = p.width - boxWidth / 2 - 18;
        const boxY = boxHeight / 2 + 18;
        p.push();
        p.noStroke();
        p.fill(255);
        p.rect(boxX, boxY, boxWidth, boxHeight, 8, 8, 8, 8);
        p.stroke(COLORS.statusBorder);
        p.strokeWeight(1);
        p.noFill();
        p.rect(boxX, boxY, boxWidth, boxHeight, 8, 8, 8, 8);
        p.fill(COLORS.statusText);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        p.text("No elements", boxX, boxY);
        p.pop();
      };

      p.setup = () => {
        const width = container.clientWidth || 836;
        const height = container.clientHeight || 519;
        p.createCanvas(width, height);
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
        p.rectMode(p.CENTER);
        p.textFont("'Geist Sans', Arial, sans-serif");
        p.noLoop();
        loaderRef.current = new P5ImageLoader(p);
        updateViewport(p.width, p.height);
      };

      p.draw = () => {
        p.background(255);

        const W = p.width;
        const H = p.height;
        const cfg = configRef.current;
        const g = computeGeometry(W, H, cfg);
        geometryRef.current = { centerX: g.centerX, centerY: g.centerY };
        const zoom = cfg.zoom;

        p.push();
        p.translate(W / 2, H / 2);
        p.scale(zoom);
        p.translate(-W / 2, -H / 2);

        drawProduct(p, g, cfg);
        drawDashedBoundary(p, g);
        drawObjects(p, objectsRef.current, { centerX: g.centerX, centerY: g.centerY, scale: 1 }, loaderRef.current!, () =>
          p.redraw(),
        );

        const selected = getSelected();
        if (selected) drawSelection(selected);

        p.pop();

        const sx = (g.centerX - W / 2) * zoom + W / 2;
        const sy = (g.centerY - H / 2) * zoom + H / 2;
        drawMeasurementLines(
          p,
          { centerX: sx, centerY: sy, width: g.width * zoom, height: g.height * zoom },
          cfg.widthCm,
          cfg.heightCm,
        );
        drawNoElementsBox();
      };

      p.windowResized = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width > 0 && height > 0) {
          p.resizeCanvas(width, height);
          updateViewport(width, height);
          p.redraw();
        }
      };

      p.mousePressed = () => {
        if (p.mouseX < 0 || p.mouseY < 0 || p.mouseX > p.width || p.mouseY > p.height) {
          return;
        }
        const world = toWorld(p.mouseX, p.mouseY);
        const selected = getSelected();
        const interaction = interactionRef.current;

        if (selected) {
          const handles = handlePositions(selected);
          if (dist(world.x, world.y, handles.rotate.x, handles.rotate.y) < 14) {
            interaction.mode = "rotate";
            interaction.startRotation = selected.rotation;
            return;
          }
          if (dist(world.x, world.y, handles.corner.x, handles.corner.y) < 14) {
            interaction.mode = "resize";
            interaction.startWidth = selected.width;
            interaction.startHeight = selected.height;
            return;
          }
        }

        const hit = hitTestObject(world.x, world.y);
        if (hit) {
          selectionRef.current = hit.id;
          interaction.mode = "drag";
          const pos = worldOf(hit);
          interaction.offsetX = world.x - pos.x;
          interaction.offsetY = world.y - pos.y;
          p.redraw();
          return;
        }

        selectionRef.current = null;
        interaction.mode = "none";
        p.redraw();
      };

      p.mouseDragged = () => {
        const selected = getSelected();
        if (!selected) return;
        const interaction = interactionRef.current;
        if (interaction.mode === "none") return;
        const world = toWorld(p.mouseX, p.mouseY);
        const pos = worldOf(selected);

        if (interaction.mode === "drag") {
          selected.x = world.x - interaction.offsetX - geometryRef.current.centerX;
          selected.y = world.y - interaction.offsetY - geometryRef.current.centerY;
        } else if (interaction.mode === "resize") {
          const dx = world.x - pos.x;
          const dy = world.y - pos.y;
          const cos = Math.cos(-selected.rotation);
          const sin = Math.sin(-selected.rotation);
          const lx = dx * cos - dy * sin;
          const ly = dx * sin + dy * cos;
          selected.width = Math.max(24, (lx + selected.width / 2) * 2);
          selected.height = Math.max(24, (ly + selected.height / 2) * 2);
        } else if (interaction.mode === "rotate") {
          const angle = Math.atan2(world.y - pos.y, world.x - pos.x);
          selected.rotation = angle + Math.PI / 2;
        }
        p.redraw();
      };

      p.mouseReleased = () => {
        if (interactionRef.current.mode !== "none") {
          interactionRef.current.mode = "none";
          onObjectsChangeRef.current(objectsRef.current.map((o) => ({ ...o })));
        }
      };

      p.doubleClicked = () => {
        const world = toWorld(p.mouseX, p.mouseY);
        const hit = hitTestObject(world.x, world.y);
        if (hit) {
          onObjectsChangeRef.current(
            objectsRef.current.map((o) =>
              o.id === hit.id ? { ...o, rotation: 0 } : o,
            ),
          );
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
          updateViewport(width, height);
          instance.redraw();
        }
      }
    });
    observer.observe(container);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectionRef.current
      ) {
        event.preventDefault();
        const id = selectionRef.current;
        const remaining = objectsRef.current.filter((o) => o.id !== id);
        objectsRef.current = remaining;
        selectionRef.current = null;
        onObjectsChangeRef.current(remaining.map((o) => ({ ...o })));
        instance.redraw();
      }
      if (event.key === "Escape") {
        selectionRef.current = null;
        instance.redraw();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    registerCapture(() => {
      const canvasEl = instance.drawingContext?.canvas as
        | HTMLCanvasElement
        | undefined;
      if (!canvasEl) return;
      const link = document.createElement("a");
      link.download = `design-${Date.now()}.png`;
      link.href = canvasEl.toDataURL("image/png");
      link.click();
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      unregisterCapture();
      if (instance) {
        instance.remove();
      }
      container.querySelectorAll("canvas").forEach((el) => el.remove());
      p5InstanceRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}