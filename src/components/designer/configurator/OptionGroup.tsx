import type { ReactNode } from "react";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export interface SegmentOption {
  label: string;
  value: string;
}

interface OptionGroupProps {
  title: string;
  options: SegmentOption[];
  active?: string | null;
  icon?: ReactNode;
  onSelect?: (value: string) => void;
}

export default function OptionGroup({
  title,
  options,
  active = null,
  icon,
  onSelect,
}: OptionGroupProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <h3 className={SECTION_LABEL_CLASS}>{title}</h3>
        {icon}
      </div>
      <div className="flex gap-1 rounded-lg bg-[#f1f3f5] p-1">
        {options.map((option) => {
          const isActive = option.value === active;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect?.(option.value)}
              className={`flex-1 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                isActive
                  ? "border border-design-border-strong bg-white font-medium text-design-text shadow-sm"
                  : "border border-transparent text-design-text-secondary hover:text-design-text"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}