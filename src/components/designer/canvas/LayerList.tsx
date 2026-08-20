"use client";

import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useDesigner, layerName } from "../state/designerStore";
import { resolveFill } from "./designDrawing";
import { SECTION_LABEL_CLASS } from "../designerTokens";

export default function LayerList() {
  const { objects, selectedId, selectObject, updateObject, updateObjects, removeObject } =
    useDesigner();

  if (objects.length === 0) {
    return (
      <section className="space-y-2">
        <h3 className={SECTION_LABEL_CLASS}>Layers</h3>
        <p className="text-[12px] text-design-text-muted">
          No elements yet — add one from the toolbar.
        </p>
      </section>
    );
  }

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= objects.length) return;
    const next = [...objects];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    updateObjects(next);
  };

  return (
    <section className="space-y-2">
      <h3 className={SECTION_LABEL_CLASS}>Layers</h3>
      <ul className="space-y-1">
        {objects.map((obj, index) => {
          const selected = obj.id === selectedId;
          return (
            <li
              key={obj.id}
              onClick={() => selectObject(selected ? null : obj.id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 ${
                selected
                  ? "border-design-accent bg-design-accent-soft"
                  : "border-design-border bg-white hover:border-design-border-strong"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateObject(obj.id, { visible: !obj.visible });
                }}
                className="text-design-text-muted hover:text-design-text"
                title={obj.visible ? "Hide" : "Show"}
              >
                {obj.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm border border-design-border-strong"
                style={{ backgroundColor: resolveFill(obj.printColor ?? obj.fill) }}
              />
              <span className="min-w-0 flex-1 truncate text-[12px] text-design-text">
                {layerName(obj, objects)}
              </span>
              <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(index, -1);
                  }}
                  className="rounded p-0.5 text-design-text-muted hover:text-design-text"
                  title="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(index, 1);
                  }}
                  className="rounded p-0.5 text-design-text-muted hover:text-design-text"
                  title="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeObject(obj.id);
                  }}
                  className="rounded p-0.5 text-design-text-muted hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}