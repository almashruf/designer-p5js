"use client";

import { useRef, useState } from "react";
import {
  Circle,
  LayoutGrid,
  LineChart,
  Smile,
  Star,
  Triangle,
  Type,
  Upload,
} from "lucide-react";
import { useDesigner, type DesignObject } from "../state/designerStore";

const DESIGNER_ICONS: Array<{
  label: string;
  icon: typeof Star;
  type: DesignObject["type"];
  fill: string;
}> = [
  { label: "Star", icon: Star, type: "star", fill: "#16a34a" },
  { label: "Circle", icon: Circle, type: "circle", fill: "#2563eb" },
  { label: "Triangle", icon: Triangle, type: "triangle", fill: "#f59e0b" },
];

const DESIGNS: Array<{ key: string; label: string; swatch: string }> = [
  { key: "stripes", label: "Stripes", swatch: "bg-[#2563eb]" },
  { key: "dots", label: "Dots", swatch: "bg-[#dc2626]" },
  { key: "checker", label: "Checker", swatch: "bg-[#111827]" },
];

type OpenMenu = "icons" | "designs" | null;

function makeObject(
  type: DesignObject["type"],
  overrides: Partial<DesignObject> = {},
): Omit<DesignObject, "id"> {
  return {
    type,
    x: 0,
    y: 0,
    width: 90,
    height: 90,
    rotation: 0,
    fill: "#1f2937",
    ...overrides,
  };
}

export default function CanvasToolbar() {
  const { addObject, showToast } = useDesigner();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => {
        const scale = 180 / image.naturalHeight;
        addObject(
          makeObject("image", {
            width: Math.round(image.naturalWidth * scale),
            height: 180,
            imageData: dataUrl,
            fill: "#000000",
          }),
        );
        showToast("Image added");
      };
      image.onerror = () => showToast("Could not load image");
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const addIcon = (icon: (typeof DESIGNER_ICONS)[number]) => {
    addObject(makeObject(icon.type, { width: 80, height: 80, fill: icon.fill }));
    showToast("Icon added — drag to move, corner handle to resize");
    setOpenMenu(null);
  };

  const addDesign = (design: string) => {
    const base: Array<Omit<DesignObject, "id">> = [];
    if (design === "stripes") {
      base.push(
        makeObject("rect", { x: -140, y: -20, width: 80, height: 160, fill: "#2563eb" }),
        makeObject("rect", { x: -20, y: -20, width: 80, height: 160, fill: "#16a34a" }),
        makeObject("rect", { x: 100, y: -20, width: 80, height: 160, fill: "#f59e0b" }),
      );
    } else if (design === "dots") {
      const positions: Array<[number, number]> = [
        [-120, -80],
        [60, -90],
        [-90, 70],
        [110, 40],
        [10, -10],
      ];
      positions.forEach(([x, y]) =>
        base.push(makeObject("circle", { x, y, width: 56, height: 56, fill: "#dc2626" })),
      );
    } else if (design === "checker") {
      base.push(
        makeObject("rect", { x: -120, y: -90, width: 110, height: 110, fill: "#111827" }),
        makeObject("rect", { x: 20, y: -90, width: 110, height: 110, fill: "#111827" }),
        makeObject("rect", { x: -120, y: 30, width: 110, height: 110, fill: "#111827" }),
        makeObject("rect", { x: 20, y: 30, width: 110, height: 110, fill: "#111827" }),
      );
    }
    base.forEach((object) => addObject(object));
    showToast(`Design "${design}" added`);
    setOpenMenu(null);
  };

  const buttonClass =
    "flex flex-1 items-center justify-center gap-2 rounded-lg border border-design-border bg-white px-3 py-2 text-[13px] text-design-text-secondary hover:border-design-border-strong hover:text-design-text";

  return (
    <div className="relative">
      <div className="flex items-stretch gap-2">
        <button type="button" className={buttonClass} onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Upload image
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            addObject(makeObject("text", { width: 160, height: 32, text: "Text" }));
            showToast("Text added");
          }}
        >
          <Type className="h-4 w-4" />
          Add text
        </button>
        <button type="button" className={buttonClass} onClick={() => toggleMenu("icons")}>
          <Smile className="h-4 w-4" />
          Select icon
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            addObject(makeObject("line", { width: 180, height: 8, fill: "#111827" }));
            showToast("Line added");
          }}
        >
          <LineChart className="h-4 w-4" />
          Add line
        </button>
        <button type="button" className={buttonClass} onClick={() => toggleMenu("designs")}>
          <LayoutGrid className="h-4 w-4" />
          Choose a design
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
          event.target.value = "";
        }}
      />

      {openMenu === "icons" && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-design-border bg-white p-2 shadow-md">
          <div className="flex gap-1.5">
            {DESIGNER_ICONS.map((icon) => {
              const Icon = icon.icon;
              return (
                <button
                  key={icon.label}
                  type="button"
                  className="flex flex-1 flex-col items-center gap-1.5 rounded-md border border-design-border px-2 py-2 text-[12px] text-design-text-secondary hover:border-design-border-strong hover:text-design-text"
                  onClick={() => addIcon(icon)}
                >
                  <Icon className="h-5 w-5" />
                  {icon.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {openMenu === "designs" && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-design-border bg-white p-2 shadow-md">
          <div className="flex gap-1.5">
            {DESIGNS.map((design) => (
              <button
                key={design.key}
                type="button"
                className="flex flex-1 flex-col items-center gap-1.5 rounded-md border border-design-border px-2 py-2 text-[12px] text-design-text-secondary hover:border-design-border-strong hover:text-design-text"
                onClick={() => addDesign(design.key)}
              >
                <span className={`h-5 w-5 rounded ${design.swatch}`} />
                {design.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}