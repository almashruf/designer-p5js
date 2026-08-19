"use client";

import { ChevronDown } from "lucide-react";
import { useDesigner, WIDTH_MAX, WIDTH_MIN, HEIGHT_MAX, HEIGHT_MIN } from "../state/designerStore";
import { SECTION_LABEL_CLASS } from "../designerTokens";

interface DimensionRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

function optionsFor(min: number, max: number): number[] {
  const options: number[] = [];
  for (let value = min; value <= max; value += 5) {
    options.push(value);
  }
  if (options[options.length - 1] !== max) options.push(max);
  return options;
}

function DimensionRow({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: DimensionRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-design-text">{label}</span>
        <div className="relative">
          <select
            aria-label={label}
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(Number(event.target.value))}
            className={`w-[104px] cursor-pointer appearance-none rounded-lg border border-design-border-strong bg-white py-1.5 pl-3 pr-8 text-sm text-design-text outline-none ${
              disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {optionsFor(min, max).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-design-text-secondary" />
        </div>
      </div>
      <p className="mt-1.5 text-[12px] text-design-text-muted">
        Min.: {min} cm. | Max.: {max} cm.
      </p>
    </div>
  );
}

export default function DimensionSelector() {
  const { config, updateConfig } = useDesigner();
  const locked = config.format === "standard";

  return (
    <section className="space-y-4">
      <h3 className={SECTION_LABEL_CLASS}>Dimensions</h3>
      <div className="space-y-4">
        <DimensionRow
          label="Width (cm):"
          value={config.widthCm}
          min={WIDTH_MIN}
          max={WIDTH_MAX}
          disabled={locked}
          onChange={(value) => updateConfig({ widthCm: value })}
        />
        <DimensionRow
          label="Height (cm):"
          value={config.heightCm}
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          disabled={locked}
          onChange={(value) => updateConfig({ heightCm: value })}
        />
      </div>
      {locked && (
        <p className="text-[11px] text-design-text-muted">
          Select “Wish” format to set custom dimensions.
        </p>
      )}
    </section>
  );
}