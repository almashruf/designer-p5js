"use client";

import { useDesigner } from "../state/designerStore";
import PreviewCanvas from "./PreviewCanvas";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export default function PreviewPanel() {
  const { config, objects, showToast } = useDesigner();

  return (
    <aside className="flex flex-col gap-5 p-6">
      <header>
        <p className={SECTION_LABEL_CLASS}>Preview</p>
      </header>

      <div className="overflow-hidden rounded-lg border border-design-border-strong">
        <div className="h-[340px] w-full">
          <PreviewCanvas config={config} objects={objects} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => showToast("Preview updated")}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-design-accent px-4 py-2 text-sm font-medium text-white hover:bg-design-accent-dark"
      >
        Preview
      </button>
    </aside>
  );
}