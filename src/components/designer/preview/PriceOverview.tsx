"use client";

import { Download, ShoppingCart } from "lucide-react";
import {
  computePrice,
  useDesigner,
  VAT_RATE,
} from "../state/designerStore";
import { captureCanvas } from "../canvas/canvasRegistry";
import { SECTION_LABEL_CLASS } from "../designerTokens";

const formatEuro = (value: number) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PriceOverview() {
  const { config, addToCart, showToast } = useDesigner();
  const price = computePrice(config);
  const vatPercent = Math.round(VAT_RATE * 100);

  const handleDownload = () => {
    if (captureCanvas()) {
      showToast("PNG downloaded");
    } else {
      showToast("Canvas is not ready yet");
    }
  };

  return (
    <footer className="border-t border-design-border px-6 py-5">
      <p className={SECTION_LABEL_CLASS}>Price overview</p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="min-w-[300px] flex-1 max-w-md space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-design-text-secondary">Net price (unit)</span>
            <span className="text-design-text tabular-nums">€{formatEuro(price.unitNet)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-design-text-secondary">
              Subtotal ({config.quantity}x)
            </span>
            <span className="text-design-text tabular-nums">€{formatEuro(price.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-design-text-secondary">VAT ({vatPercent}%)</span>
            <span className="text-design-text tabular-nums">€{formatEuro(price.vat)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-design-border pt-2.5">
            <span className="text-design-text">
              Total including VAT,{" "}
              <strong className="tabular-nums">€{formatEuro(price.total)}</strong> plus shipping.
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <button
            type="button"
            onClick={addToCart}
            className="inline-flex items-center gap-2 rounded-lg bg-design-accent px-4 py-2 text-sm font-medium text-white hover:bg-design-accent-dark"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-design-border-strong bg-white px-4 py-2 text-sm font-medium text-design-text hover:border-design-border-strong"
          >
            <Download className="h-4 w-4" />
            Download PNG-8
          </button>
          <p className="mt-1 max-w-[260px] text-right text-xs leading-snug text-design-text-muted">
            Example pricing — computed from area, options and quantity.
          </p>
        </div>
      </div>
    </footer>
  );
}