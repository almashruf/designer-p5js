"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useDesigner } from "../state/designerStore";
import {
  PRINT_PALETTE,
  PALETTE_FAMILIES,
  colorByCode,
  type PrintColor,
} from "../printPalette";
import { SECTION_LABEL_CLASS } from "../designerTokens";

function isLight(hex: string): boolean {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
}

function Swatch({
  color,
  selected,
  onSelect,
}: {
  color: PrintColor;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Set color ${color.code} ${color.hex}`}
      onClick={onSelect}
      title={`${color.code} · ${color.hex}`}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-transform hover:scale-105 ${
        selected
          ? "border-design-accent ring-1 ring-design-accent"
          : "border-design-border-strong hover:border-design-border-strong"
      }`}
      style={{ backgroundColor: color.hex }}
    >
      {selected && (
        <Check
          className={`h-4 w-4 ${isLight(color.hex) ? "text-design-text" : "text-white"}`}
        />
      )}
    </button>
  );
}

export default function ColorSelector() {
  const { config, updateConfig } = useDesigner();
  const [open, setOpen] = useState(false);
  const [family, setFamily] = useState<string>("all");

  const current = colorByCode(config.baseColor);

  const visibleColors =
    family === "all"
      ? PRINT_PALETTE
      : PRINT_PALETTE.filter((c) => c.family === family);

  return (
    <section className="space-y-2.5">
      <h3 className={SECTION_LABEL_CLASS}>Base color</h3>
      <div className="relative flex items-center gap-3 rounded-xl border border-design-border bg-design-panel p-3">
        <div
          className="h-11 w-11 shrink-0 rounded-lg border border-design-border-strong"
          style={{ backgroundColor: current?.hex ?? "#ffffff" }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-design-text">base color</p>
          <p className="mt-0.5 text-[12px] uppercase text-design-text-muted">
            {current ? `${current.code} · ${current.hex}` : config.baseColor}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 rounded-md bg-design-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-design-accent-dark"
        >
          change
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-xl border border-design-border bg-white p-3 shadow-md">
            <div className="mb-2.5 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setFamily("all")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  family === "all"
                    ? "bg-design-accent text-white"
                    : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
                }`}
              >
                All ({PRINT_PALETTE.length})
              </button>
              {PALETTE_FAMILIES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFamily(f.key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    family === f.key
                      ? "bg-design-accent text-white"
                      : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid max-h-[260px] grid-cols-6 gap-2 overflow-y-auto">
              {visibleColors.map((color) => (
                <Swatch
                  key={color.code}
                  color={color}
                  selected={config.baseColor === color.code}
                  onSelect={() => {
                    updateConfig({ baseColor: color.code });
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}