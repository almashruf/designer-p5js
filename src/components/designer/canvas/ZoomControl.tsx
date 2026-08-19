"use client";

import { Minus, Plus } from "lucide-react";
import { useDesigner } from "../state/designerStore";
import { ZOOM_MAX, ZOOM_MIN } from "../state/designerStore";

const ZOOM_STEP = 0.25;

export default function ZoomControl() {
  const { config, updateConfig } = useDesigner();
  const zoom = config.zoom;

  const clamp = (value: number) =>
    Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));

  const setZoom = (value: number) => updateConfig({ zoom: clamp(value) });

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-medium text-design-text">Zoom</span>
      <button
        type="button"
        onClick={() => setZoom(zoom - ZOOM_STEP)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-design-border-strong bg-white text-design-text-secondary hover:text-design-text"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="range"
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={0.01}
        value={zoom}
        onChange={(event) => setZoom(Number(event.target.value))}
        aria-label="Zoom"
        className="design-slider h-1.5 w-44 cursor-pointer appearance-none rounded-full bg-[#e4e7ea] accent-design-accent"
      />
      <button
        type="button"
        onClick={() => setZoom(zoom + ZOOM_STEP)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-design-border-strong bg-white text-design-text-secondary hover:text-design-text"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
      <span className="w-11 text-right text-xs tabular-nums text-design-text-muted">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}