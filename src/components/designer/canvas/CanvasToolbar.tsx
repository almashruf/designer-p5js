"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Circle,
  Cloud,
  Cross,
  Flower2,
  Heart,
  LayoutGrid,
  LineChart,
  Moon,
  Music,
  PawPrint,
  Plus,
  Smile,
  Snowflake,
  Star,
  Sun,
  Triangle,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { useDesigner, type DesignObject } from "../state/designerStore";
import { nearestPaletteCode } from "../printPalette";

interface IconDef {
  label: string;
  icon: typeof Star;
  type: DesignObject["type"];
  fill: string;
}

const ICON_TABS: Array<{ key: string; label: string; icons: IconDef[] }> = [
  {
    key: "nature",
    label: "Nature",
    icons: [
      { label: "Star", icon: Star, type: "star", fill: "#16a34a" },
      { label: "Heart", icon: Heart, type: "heart", fill: "#dc2626" },
      { label: "Leaf", icon: Flower2, type: "star", fill: "#15803d" },
      { label: "Paw", icon: PawPrint, type: "circle", fill: "#6b7078" },
      { label: "Snowflake", icon: Snowflake, type: "cross", fill: "#2563eb" },
    ],
  },
  {
    key: "sky",
    label: "Sky",
    icons: [
      { label: "Moon", icon: Moon, type: "moon", fill: "#7c3aed" },
      { label: "Sun", icon: Sun, type: "circle", fill: "#f59e0b" },
      { label: "Cloud", icon: Cloud, type: "circle", fill: "#93c5fd" },
      { label: "Bolt", icon: Zap, type: "bolt", fill: "#f59e0b" },
      { label: "Star", icon: Star, type: "star", fill: "#fbbf24" },
    ],
  },
  {
    key: "shapes",
    label: "Shapes",
    icons: [
      { label: "Circle", icon: Circle, type: "circle", fill: "#2563eb" },
      { label: "Triangle", icon: Triangle, type: "triangle", fill: "#f59e0b" },
      { label: "Cross", icon: Cross, type: "cross", fill: "#dc2626" },
      { label: "Arrow", icon: ArrowUpRight, type: "arrow", fill: "#16a34a" },
      { label: "Plus", icon: Plus, type: "cross", fill: "#1f2937" },
    ],
  },
  {
    key: "animal",
    label: "Animal",
    icons: [
      { label: "Heart", icon: Heart, type: "heart", fill: "#db2777" },
      { label: "Paw", icon: PawPrint, type: "circle", fill: "#7c5e46" },
      { label: "Star", icon: Star, type: "star", fill: "#f59e0b" },
      { label: "Moon", icon: Moon, type: "moon", fill: "#6366f1" },
      { label: "Bolt", icon: Zap, type: "bolt", fill: "#f97316" },
    ],
  },
  {
    key: "music",
    label: "Music",
    icons: [
      { label: "Music", icon: Music, type: "moon", fill: "#7c3aed" },
      { label: "Heart", icon: Heart, type: "heart", fill: "#be185d" },
      { label: "Star", icon: Star, type: "star", fill: "#0d9488" },
      { label: "Cross", icon: Cross, type: "cross", fill: "#1d4ed8" },
      { label: "Circle", icon: Circle, type: "circle", fill: "#65a30d" },
    ],
  },
  {
    key: "sport",
    label: "Sport",
    icons: [
      { label: "Bolt", icon: Zap, type: "bolt", fill: "#ea580c" },
      { label: "Arrow", icon: ArrowUpRight, type: "arrow", fill: "#2563eb" },
      { label: "Triangle", icon: Triangle, type: "triangle", fill: "#16a34a" },
      { label: "Circle", icon: Circle, type: "circle", fill: "#dc2626" },
      { label: "Star", icon: Star, type: "star", fill: "#f59e0b" },
    ],
  },
  {
    key: "tech",
    label: "Tech",
    icons: [
      { label: "Bolt", icon: Zap, type: "bolt", fill: "#f59e0b" },
      { label: "Moon", icon: Moon, type: "moon", fill: "#6b7280" },
      { label: "Cross", icon: Cross, type: "cross", fill: "#2563eb" },
      { label: "Arrow", icon: ArrowUpRight, type: "arrow", fill: "#0d9488" },
      { label: "Star", icon: Star, type: "star", fill: "#7c3aed" },
    ],
  },
];

const DESIGN_TABS: Array<{
  key: string;
  label: string;
  designs: Array<{ key: string; label: string; swatch: string }>;
}> = [
  {
    key: "basic",
    label: "Basic",
    designs: [
      { key: "stripes", label: "Stripes", swatch: "bg-[#2563eb]" },
      { key: "dots", label: "Dots", swatch: "bg-[#dc2626]" },
      { key: "checker", label: "Checker", swatch: "bg-[#111827]" },
    ],
  },
  {
    key: "waves",
    label: "Waves",
    designs: [
      { key: "waves", label: "Waves", swatch: "bg-[#2563eb]" },
      { key: "zigzag", label: "Zigzag", swatch: "bg-[#16a34a]" },
    ],
  },
  {
    key: "rings",
    label: "Rings",
    designs: [
      { key: "rings", label: "Rings", swatch: "bg-[#f59e0b]" },
      { key: "circles", label: "Circles", swatch: "bg-[#dc2626]" },
    ],
  },
  {
    key: "patterns",
    label: "Patterns",
    designs: [
      { key: "grid", label: "Grid", swatch: "bg-[#7c3aed]" },
      { key: "herringbone", label: "Herringbone", swatch: "bg-[#0d9488]" },
    ],
  },
  {
    key: "frames",
    label: "Frames",
    designs: [
      { key: "border", label: "Border", swatch: "bg-[#1f2937]" },
      { key: "corner", label: "Corner", swatch: "bg-[#2563eb]" },
    ],
  },
];

type OpenMenu = "icons" | "designs" | null;

function makeObject(
  type: DesignObject["type"],
  overrides: Partial<DesignObject> = {},
): Omit<DesignObject, "id"> {
  const fill = overrides.fill ?? "#1f2937";
  return {
    type,
    x: 0,
    y: 0,
    width: 90,
    height: 90,
    rotation: 0,
    fill,
    printColor: nearestPaletteCode(fill),
    ...overrides,
  };
}

function readDpi(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result as ArrayBuffer;
      const bytes = new Uint8Array(buf);
      const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
      const isPng =
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47;
      if (!isJpeg && !isPng) {
        resolve(null);
        return;
      }
      if (isJpeg) {
        let i = 2;
        while (i < bytes.length) {
          if (bytes[i] !== 0xff) {
            i++;
            continue;
          }
          const marker = bytes[i + 1];
          if (marker === 0xe0) {
            const len = (bytes[i + 2] << 8) | bytes[i + 3];
            if (len >= 14 && bytes[i + 4] === 0x4a && bytes[i + 5] === 0x46 && bytes[i + 6] === 0x49 && bytes[i + 7] === 0x46) {
              const density = (bytes[i + 12] << 8) | bytes[i + 13];
              if (density > 0) resolve(density);
              else resolve(null);
              return;
            }
            i += 2 + len;
          } else {
            i += 2;
          }
        }
        resolve(null);
        return;
      }
      let i = 8;
      while (i < bytes.length) {
        const len =
          (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
        const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
        if (type === "pHYs") {
          const ppuX =
            (bytes[i + 8] << 24) |
            (bytes[i + 9] << 16) |
            (bytes[i + 10] << 8) |
            bytes[i + 11];
          resolve(Math.round(ppuX / 39.3701));
          return;
        }
        i += 12 + len;
      }
      resolve(null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
}

export default function CanvasToolbar() {
  const { addObject, showToast } = useDesigner();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [iconTab, setIconTab] = useState("nature");
  const [designTab, setDesignTab] = useState("basic");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const handleUpload = async (file: File) => {
    const isVector = file.type.includes("svg") || file.name.endsWith(".svg");
    const dpi = isVector ? null : await readDpi(file);
    if (!isVector && dpi !== null && dpi < 250) {
      showToast(`Image ${dpi} DPI — min 250 DPI required`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(180 / image.naturalHeight, 600 / image.naturalWidth);
        addObject(
          makeObject("image", {
            width: Math.max(24, Math.round(image.naturalWidth * scale)),
            height: Math.max(24, Math.round(image.naturalHeight * scale)),
            imageData: dataUrl,
          }),
        );
        showToast(isVector ? "SVG added" : "Image added");
      };
      image.onerror = () => showToast("Could not load image");
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const addIcon = (icon: IconDef) => {
    addObject(makeObject(icon.type, { width: 80, height: 80, fill: icon.fill }));
    showToast("Icon added");
    setOpenMenu(null);
  };

  const addDesign = (design: string) => {
    const base: Array<Omit<DesignObject, "id">> = [];
    switch (design) {
      case "stripes":
        base.push(
          makeObject("rect", { x: -140, y: -20, width: 80, height: 160, fill: "#2563eb" }),
          makeObject("rect", { x: -20, y: -20, width: 80, height: 160, fill: "#16a34a" }),
          makeObject("rect", { x: 100, y: -20, width: 80, height: 160, fill: "#f59e0b" }),
        );
        break;
      case "dots": {
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
        break;
      }
      case "checker":
        base.push(
          makeObject("rect", { x: -120, y: -90, width: 110, height: 110, fill: "#111827" }),
          makeObject("rect", { x: 20, y: -90, width: 110, height: 110, fill: "#111827" }),
          makeObject("rect", { x: -120, y: 30, width: 110, height: 110, fill: "#111827" }),
          makeObject("rect", { x: 20, y: 30, width: 110, height: 110, fill: "#111827" }),
        );
        break;
      case "waves": {
        const positions: Array<[number, number]> = [
          [-150, -60],
          [-60, -10],
          [30, 40],
          [120, 90],
        ];
        positions.forEach(([x, y]) =>
          base.push(makeObject("rect", { x, y, width: 90, height: 34, fill: "#2563eb", rotation: 0.35 })),
        );
        break;
      }
      case "zigzag": {
        const positions: Array<[number, number]> = [
          [-150, -50],
          [-60, 10],
          [30, -50],
          [120, 10],
        ];
        positions.forEach(([x, y]) =>
          base.push(makeObject("rect", { x, y, width: 90, height: 26, fill: "#16a34a", rotation: -0.5 })),
        );
        break;
      }
      case "rings": {
        const radii = [150, 100, 50];
        radii.forEach((r, i) =>
          base.push(makeObject("circle", { x: 0, y: 0, width: r, height: r, fill: ["#f59e0b", "#fbbf24", "#fde68a"][i] })),
        );
        break;
      }
      case "circles": {
        const positions: Array<[number, number, number]> = [
          [-130, -40, 120],
          [90, -60, 80],
          [-40, 90, 90],
          [130, 50, 60],
        ];
        positions.forEach(([x, y, r]) =>
          base.push(makeObject("circle", { x, y, width: r, height: r, fill: "#dc2626" })),
        );
        break;
      }
      case "grid": {
        const positions: Array<[number, number]> = [];
        for (let gy = -80; gy <= 80; gy += 80) {
          for (let gx = -140; gx <= 140; gx += 70) {
            positions.push([gx, gy]);
          }
        }
        positions.forEach(([x, y]) =>
          base.push(makeObject("rect", { x, y, width: 48, height: 48, fill: "#7c3aed" })),
        );
        break;
      }
      case "herringbone": {
        const positions: Array<[number, number, number]> = [
          [-120, -60, -0.7],
          [-30, -60, 0.7],
          [60, -60, -0.7],
          [-75, 30, 0.7],
          [15, 30, -0.7],
          [105, 30, 0.7],
        ];
        positions.forEach(([x, y, rot]) =>
          base.push(makeObject("rect", { x, y, width: 70, height: 30, fill: "#0d9488", rotation: rot })),
        );
        break;
      }
      case "border": {
        const t = 18;
        base.push(
          makeObject("rect", { x: 0, y: -105, width: 460, height: t, fill: "#1f2937" }),
          makeObject("rect", { x: 0, y: 105, width: 460, height: t, fill: "#1f2937" }),
          makeObject("rect", { x: -230, y: 0, width: t, height: 210, fill: "#1f2937" }),
          makeObject("rect", { x: 230, y: 0, width: t, height: 210, fill: "#1f2937" }),
        );
        break;
      }
      case "corner": {
        const t = 20;
        base.push(
          makeObject("rect", { x: -215, y: -95, width: 70, height: t, fill: "#2563eb" }),
          makeObject("rect", { x: -215, y: -95, width: t, height: 70, fill: "#2563eb" }),
          makeObject("rect", { x: 215, y: -95, width: 70, height: t, fill: "#2563eb" }),
          makeObject("rect", { x: 215, y: -95, width: t, height: 70, fill: "#2563eb" }),
          makeObject("rect", { x: -215, y: 95, width: 70, height: t, fill: "#2563eb" }),
          makeObject("rect", { x: -215, y: 95, width: t, height: 70, fill: "#2563eb" }),
          makeObject("rect", { x: 215, y: 95, width: 70, height: t, fill: "#2563eb" }),
          makeObject("rect", { x: 215, y: 95, width: t, height: 70, fill: "#2563eb" }),
        );
        break;
      }
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
            addObject(makeObject("text", { width: 160, height: 32, text: "Text", align: "center" }));
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
        accept="image/png,image/jpeg,image/svg+xml,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleUpload(file);
          event.target.value = "";
        }}
      />

      {openMenu === "icons" && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-design-border bg-white p-2 shadow-md">
          <div className="mb-2 flex flex-wrap gap-1">
            {ICON_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setIconTab(tab.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  iconTab === tab.key
                    ? "bg-design-accent text-white"
                    : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {ICON_TABS.find((t) => t.key === iconTab)?.icons.map((icon) => {
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
          <div className="mb-2 flex flex-wrap gap-1">
            {DESIGN_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setDesignTab(tab.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  designTab === tab.key
                    ? "bg-design-accent text-white"
                    : "bg-[#f1f3f5] text-design-text-secondary hover:text-design-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {DESIGN_TABS.find((t) => t.key === designTab)?.designs.map((design) => (
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