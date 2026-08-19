"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BASE_COLOR_SWATCHES, useDesigner } from "../state/designerStore";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export default function ColorSelector() {
  const { config, updateConfig } = useDesigner();
  const [open, setOpen] = useState(false);

  const hex = config.baseColor.toUpperCase();

  return (
    <section className="space-y-2.5">
      <h3 className={SECTION_LABEL_CLASS}>Base color</h3>
      <div className="relative flex items-center gap-3 rounded-xl border border-design-border bg-design-panel p-3">
        <div
          className="h-11 w-11 shrink-0 rounded-lg border border-design-border-strong"
          style={{ backgroundColor: config.baseColor }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-design-text">base color</p>
          <p className="mt-0.5 text-[12px] uppercase text-design-text-muted">
            {hex}
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
            <div className="grid grid-cols-5 gap-2">
              {BASE_COLOR_SWATCHES.map((color) => {
                const selected = config.baseColor.toUpperCase() === color;
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Set color ${color}`}
                    onClick={() => {
                      updateConfig({ baseColor: color });
                      setOpen(false);
                    }}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-lg border ${
                      selected
                        ? "border-design-accent"
                        : "border-design-border-strong hover:border-design-border-strong"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selected && (
                      <Check
                        className={`h-4 w-4 ${
                          ["#ffffff", "#f8fafc", "#e5e7eb"].includes(color)
                            ? "text-design-text"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}