"use client";

import { ChevronDown } from "lucide-react";
import {
  useDesigner,
  WIDTH_MAX,
  WIDTH_MIN,
  HEIGHT_MAX,
  HEIGHT_MIN,
  STANDARD_WIDTHS,
  STANDARD_HEIGHTS,
} from "../state/designerStore";
import { SECTION_LABEL_CLASS } from "../designerTokens";

interface DimensionRowProps {
  label: string;
  value: number;
  standardOptions: number[];
  min: number;
  max: number;
  locked: boolean;
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
  standardOptions,
  min,
  max,
  locked,
  onChange,
}: DimensionRowProps) {
  const options = locked ? standardOptions : optionsFor(min, max);
  const safeValue = options.includes(value) ? value : options[0];
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-design-text">{label}</span>
        <div className="relative">
          <select
            aria-label={label}
            value={safeValue}
            disabled={false}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-[104px] cursor-pointer appearance-none rounded-lg border border-design-border-strong bg-white py-1.5 pl-3 pr-8 text-sm text-design-text outline-none"
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-design-text-secondary" />
        </div>
      </div>
      <p className="mt-1.5 text-[12px] text-design-text-muted">
        {locked
          ? `Standard: ${standardOptions.join(" · ")} cm`
          : `Min.: ${min} cm. | Max.: ${max} cm.`}
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
          standardOptions={STANDARD_WIDTHS}
          min={WIDTH_MIN}
          max={WIDTH_MAX}
          locked={locked}
          onChange={(value) => updateConfig({ widthCm: value })}
        />
        <DimensionRow
          label="Height (cm):"
          value={config.heightCm}
          standardOptions={STANDARD_HEIGHTS}
          min={HEIGHT_MIN}
          max={HEIGHT_MAX}
          locked={locked}
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