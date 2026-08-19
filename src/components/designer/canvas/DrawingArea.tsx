"use client";

import { useDesigner, CM_TO_PX } from "../state/designerStore";
import P5Canvas from "./P5Canvas";
import ZoomControl from "./ZoomControl";
import CanvasToolbar from "./CanvasToolbar";

export default function DrawingArea() {
  const { config, objects, updateObjects } = useDesigner();
  const pxWidth = config.widthCm * CM_TO_PX;
  const pxHeight = config.heightCm * CM_TO_PX;

  return (
    <section className="flex flex-col border-r border-design-border">
      <div className="p-6 pb-4">
        <div className="h-[520px] w-full overflow-hidden rounded-lg border border-design-product-border bg-white">
          <P5Canvas config={config} objects={objects} onObjectsChange={updateObjects} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 pb-4">
        <ZoomControl />
        <p className="text-[12px] tabular-nums text-design-text-muted">
          {pxWidth}×{pxHeight} px {objects.length} element{objects.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="border-t border-design-border p-3">
        <CanvasToolbar />
      </div>
    </section>
  );
}