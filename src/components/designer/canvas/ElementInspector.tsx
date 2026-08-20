"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import {
  useDesigner,
  FONT_CHOICES,
  TEXT_SIZE_LADDER,
  type DesignObject,
  type TextAlign,
} from "../state/designerStore";
import {
  PRINT_PALETTE,
  PALETTE_FAMILIES,
  colorByCode,
  type PrintColor,
} from "../printPalette";
import { layerName } from "../state/designerStore";
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
      aria-label={`Assign print color ${color.code}`}
      onClick={onSelect}
      title={`${color.code} · ${color.hex}`}
      className={`relative flex h-7 w-7 items-center justify-center rounded-md border ${
        selected
          ? "border-design-accent ring-1 ring-design-accent"
          : "border-design-border-strong hover:border-design-border-strong"
      }`}
      style={{ backgroundColor: color.hex }}
    >
      {selected && (
        <span
          className={`h-2 w-2 rounded-full ${isLight(color.hex) ? "bg-design-text" : "bg-white"}`}
        />
      )}
    </button>
  );
}

function PrintColorPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (code: string) => void;
}) {
  const [family, setFamily] = useState<string>("all");
  const visibleColors =
    family === "all"
      ? PRINT_PALETTE
      : PRINT_PALETTE.filter((c) => c.family === family);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setFamily("all")}
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            family === "all"
              ? "bg-design-accent text-white"
              : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
          }`}
        >
          All
        </button>
        {PALETTE_FAMILIES.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFamily(f.key)}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              family === f.key
                ? "bg-design-accent text-white"
                : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
            }`}
          >
            {f.key}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {visibleColors.map((color) => (
          <Swatch
            key={color.code}
            color={color}
            selected={value === color.code}
            onSelect={() => onChange(color.code)}
          />
        ))}
      </div>
      {value && (
        <p className="text-[11px] text-design-text-muted">
          Print colour: {colorByCode(value)?.code} · {colorByCode(value)?.hex}
        </p>
      )}
    </div>
  );
}

function TextSettings({
  obj,
  update,
}: {
  obj: DesignObject;
  update: (patch: Partial<DesignObject>) => void;
}) {
  const toggle = (key: "bold" | "italic" | "underline") =>
    update({ [key]: !obj[key] });

  const buttonClass = (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-md border ${
      active
        ? "border-design-accent bg-design-accent-soft text-design-accent"
        : "border-design-border-strong bg-white text-design-text-secondary hover:text-design-text"
    }`;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-design-text-secondary">
          Text
        </label>
        <input
          type="text"
          value={obj.text ?? ""}
          onChange={(e) => update({ text: e.target.value })}
          className="w-full rounded-lg border border-design-border-strong px-2.5 py-1.5 text-sm text-design-text outline-none focus:border-design-accent"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-design-text-secondary">
          Font
        </label>
        <select
          value={obj.fontFamily ?? "Arial"}
          onChange={(e) => update({ fontFamily: e.target.value })}
          className="w-full cursor-pointer rounded-lg border border-design-border-strong bg-white px-2 py-1.5 text-sm text-design-text outline-none"
        >
          {FONT_CHOICES.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button type="button" className={buttonClass(!!obj.bold)} onClick={() => toggle("bold")} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={buttonClass(!!obj.italic)} onClick={() => toggle("italic")} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={buttonClass(!!obj.underline)} onClick={() => toggle("underline")} title="Underline">
          <Underline className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {(["left", "center", "right"] as TextAlign[]).map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => update({ align })}
            className={`rounded-md border px-2 py-1 text-[11px] capitalize ${
              (obj.align ?? "center") === align
                ? "border-design-accent bg-design-accent-soft font-medium text-design-accent"
                : "border-design-border-strong bg-white text-design-text-secondary hover:text-design-text"
            }`}
          >
            {align}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-design-text-secondary">
          Size ({Math.round(obj.height)} mm)
        </label>
        <div className="flex flex-wrap gap-1">
          {TEXT_SIZE_LADDER.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => update({ height: size })}
              className={`rounded-md border px-1.5 py-0.5 text-[10px] tabular-nums ${
                Math.round(obj.height) === size
                  ? "border-design-accent bg-design-accent-soft font-medium text-design-accent"
                  : "border-design-border-strong bg-white text-design-text-secondary hover:text-design-text"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-design-text">
        <input
          type="checkbox"
          checked={!!obj.autoFit}
          onChange={(e) => update({ autoFit: e.target.checked })}
          className="h-3.5 w-3.5 accent-design-accent"
        />
        Auto-fit text
      </label>

      <div className="flex items-center gap-2">
        <label className="flex-1 cursor-pointer items-center gap-2 text-[12px] text-design-text">
          <input
            type="checkbox"
            checked={!!obj.textBg}
            onChange={(e) => update({ textBg: e.target.checked ? obj.fill : null })}
            className="mr-1.5 h-3.5 w-3.5 accent-design-accent"
          />
          Text background
        </label>
        {obj.textBg && (
          <input
            type="color"
            value={colorByCode(obj.textBg)?.hex ?? obj.textBg}
            onChange={(e) => update({ textBg: e.target.value })}
            className="h-7 w-10 cursor-pointer rounded border border-design-border-strong"
          />
        )}
      </div>
    </div>
  );
}

export default function ElementInspector() {
  const { objects, selectedId, updateObject } = useDesigner();
  const selected = objects.find((o) => o.id === selectedId) ?? null;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  if (!selected) return null;

  return (
    <div
      ref={ref}
      className="rounded-lg border border-design-border bg-white p-3 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-design-text">
          {layerName(selected, objects)}
        </p>
        <span className="text-[10px] uppercase tracking-wide text-design-text-muted">
          {selected.type}
        </span>
      </div>

      {selected.type === "text" ? (
        <TextSettings obj={selected} update={(patch) => updateObject(selected.id, patch)} />
      ) : (
        <div className="space-y-2">
          <p className={SECTION_LABEL_CLASS}>Print colour</p>
          <PrintColorPicker
            value={selected.printColor ?? selected.fill}
            onChange={(code) => updateObject(selected.id, { printColor: code, fill: code })}
          />
        </div>
      )}

      {selected.type === "text" && (
        <div className="mt-3 border-t border-design-border pt-2">
          <p className={SECTION_LABEL_CLASS}>Print colour</p>
          <div className="mt-1.5">
            <PrintColorPicker
              value={selected.printColor ?? selected.fill}
              onChange={(code) => updateObject(selected.id, { printColor: code, fill: code })}
            />
          </div>
        </div>
      )}
    </div>
  );
}