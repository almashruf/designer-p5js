"use client";

import { Minus, Plus } from "lucide-react";
import { useDesigner } from "../state/designerStore";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export default function QuantitySelector() {
  const { config, updateConfig } = useDesigner();
  const quantity = config.quantity;

  const setQuantity = (value: number) =>
    updateConfig({ quantity: Math.min(999, Math.max(1, value)) });

  return (
    <section className="space-y-2.5">
      <h3 className={SECTION_LABEL_CLASS}>Quantity</h3>
      <div className="inline-flex items-center overflow-hidden rounded-lg border border-design-border-strong">
        <button
          type="button"
          onClick={() => setQuantity(quantity - 1)}
          disabled={quantity <= 1}
          className="flex h-8 w-8 items-center justify-center text-design-text-secondary hover:bg-[#f1f3f5] hover:text-design-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-medium text-design-text tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          disabled={quantity >= 999}
          className="flex h-8 w-8 items-center justify-center text-design-text-secondary hover:bg-[#f1f3f5] hover:text-design-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}