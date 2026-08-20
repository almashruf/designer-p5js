"use client";

import { AlertTriangle, Download, ShoppingCart } from "lucide-react";
import {
  computePrice,
  unassignedObjects,
  useDesigner,
  VAT_RATE,
} from "../state/designerStore";
import { runPrintChecks } from "../printChecks";
import { captureCanvas } from "../canvas/canvasRegistry";
import { SECTION_LABEL_CLASS } from "../designerTokens";

const formatEuro = (value: number) =>
  value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function PriceOverview() {
  const { config, objects, addToCart, showToast } = useDesigner();
  const price = computePrice(config, objects.length);
  const vatPercent = Math.round(VAT_RATE * 100);
  const missing = unassignedObjects(objects);
  const cartBlocked = missing.length > 0;
  const qualityWarnings = runPrintChecks(config, objects);
  const qualityBlocked = qualityWarnings.some((w) => w.severity === "error");
  const orderBlocked = cartBlocked || qualityBlocked;

  const handleDownload = (mode: "png" | "png8" | "svg" | "proof") => {
    if (captureCanvas(mode)) {
      const label =
        mode === "png8"
          ? "PNG-8 downloaded"
          : mode === "svg"
            ? "SVG downloaded"
            : mode === "proof"
              ? "Proof sheet downloaded"
              : "PNG downloaded";
      showToast(label);
    } else {
      showToast("Canvas is not ready yet");
    }
  };

  const handleAddToCart = () => {
    if (orderBlocked) {
      if (cartBlocked) {
        showToast(
          `Assign a print colour to ${missing.length} element${missing.length > 1 ? "s" : ""} first`,
        );
      } else {
        showToast("Fix print-quality errors before ordering");
      }
      return;
    }
    addToCart();
  };

  return (
    <footer className="border-t border-design-border px-6 py-5">
      <p className={SECTION_LABEL_CLASS}>Price overview</p>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div className="min-w-[300px] flex-1 max-w-md space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-design-text-secondary">
              Price / m² ({price.pricePerSqm} €/m²)
            </span>
            <span className="text-design-text tabular-nums">€{formatEuro(price.areaNet)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-design-text-secondary">
              {price.areaSqm.toFixed(2)} m² × {config.widthCm}×{config.heightCm} cm
            </span>
            <span className="text-design-text tabular-nums">€{formatEuro(price.areaNet)}</span>
          </div>
          {price.fireSurcharge > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-design-text-secondary">Schwer entflammbar</span>
              <span className="text-design-text tabular-nums">€{formatEuro(price.fireSurcharge)}</span>
            </div>
          )}
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

          {cartBlocked && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {missing.length} element{missing.length > 1 ? "s" : ""} without a
                print colour — assign colours before ordering.
              </span>
            </div>
          )}

          {qualityWarnings.length > 0 && (
            <div className="space-y-1">
              {qualityWarnings.map((w) => (
                <div
                  key={w.id}
                  className={`flex items-start gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                    w.severity === "error"
                      ? "border-red-300 bg-red-50 text-red-800"
                      : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={orderBlocked}
            className="inline-flex items-center gap-2 rounded-lg bg-design-accent px-4 py-2 text-sm font-medium text-white hover:bg-design-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => handleDownload("png")}
              className="inline-flex items-center gap-2 rounded-lg border border-design-border-strong bg-white px-3 py-2 text-sm font-medium text-design-text hover:border-design-border-strong"
            >
              <Download className="h-4 w-4" />
              PNG
            </button>
            <button
              type="button"
              onClick={() => handleDownload("png8")}
              className="inline-flex items-center gap-2 rounded-lg border border-design-border-strong bg-white px-3 py-2 text-sm font-medium text-design-text hover:border-design-border-strong"
            >
              <Download className="h-4 w-4" />
              PNG-8
            </button>
            <button
              type="button"
              onClick={() => handleDownload("svg")}
              className="inline-flex items-center gap-2 rounded-lg border border-design-border-strong bg-white px-3 py-2 text-sm font-medium text-design-text hover:border-design-border-strong"
            >
              <Download className="h-4 w-4" />
              SVG
            </button>
            <button
              type="button"
              onClick={() => handleDownload("proof")}
              className="inline-flex items-center gap-2 rounded-lg border border-design-border-strong bg-white px-3 py-2 text-sm font-medium text-design-text hover:border-design-border-strong"
            >
              <Download className="h-4 w-4" />
              Proof
            </button>
          </div>
          <p className="mt-1 max-w-[260px] text-right text-xs leading-snug text-design-text-muted">
            {objects.length > 0
              ? `${price.pricePerSqm} €/m² with design${config.form === "rund" ? " · round mat 149 €/m²" : ""} · 19% VAT · shipping extra`
              : "100 €/m² base · 110 €/m² with design · 149 €/m² round"}
          </p>
        </div>
      </div>
    </footer>
  );
}