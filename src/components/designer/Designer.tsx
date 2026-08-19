"use client";

import Configurator from "./configurator/Configurator";
import DrawingArea from "./canvas/DrawingArea";
import PreviewPanel from "./preview/PreviewPanel";
import PriceOverview from "./preview/PriceOverview";
import { DesignerProvider, useDesigner } from "./state/designerStore";

function Toast() {
  const { toast } = useDesigner();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-design-border bg-white px-4 py-2.5 text-sm text-design-text shadow-lg">
      {toast}
    </div>
  );
}

function DesignerShell() {
  return (
    <div className="min-h-screen px-6 py-6">
      <div className="mx-auto flex max-w-[1560px] flex-col overflow-hidden rounded-2xl border border-design-border-strong bg-design-panel">
        <header className="flex items-center justify-between border-b border-design-border px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-design-text-muted">
              Online designer
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-[0.06em] text-design-text">
              DESIGNER
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-[minmax(300px,352px)_minmax(0,1fr)_minmax(260px,304px)]">
          <Configurator />
          <DrawingArea />
          <PreviewPanel />
        </div>

        <PriceOverview />
      </div>

      <Toast />
    </div>
  );
}

export default function Designer() {
  return (
    <DesignerProvider>
      <DesignerShell />
    </DesignerProvider>
  );
}