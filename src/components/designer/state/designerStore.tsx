"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { PRINT_PALETTE } from "../printPalette";

export type Form = "eckig" | "rund";
export type Format = "standard" | "wish";
export type Delivery = "overnight" | "express" | "standard";
export type TextAlign = "left" | "center" | "right";

export interface ProductConfig {
  baseColor: string;
  edge: boolean;
  flameRetardant: boolean;
  form: Form;
  format: Format;
  widthCm: number;
  heightCm: number;
  delivery: Delivery;
  quantity: number;
  zoom: number;
}

export interface DesignObject {
  id: string;
  type:
    | "rect"
    | "circle"
    | "star"
    | "triangle"
    | "heart"
    | "bolt"
    | "moon"
    | "arrow"
    | "cross"
    | "text"
    | "line"
    | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  printColor?: string;
  text?: string;
  imageData?: string;
  visible?: boolean;
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: TextAlign;
  autoFit?: boolean;
  textBg?: string | null;
}

export const DEFAULT_WIDTH_CM = 60;
export const DEFAULT_HEIGHT_CM = 40;
export const FLAME_SURCHARGE = 45;
export const VAT_RATE = 0.19;
export const WIDTH_MIN = 40;
export const WIDTH_MAX = 200;
export const HEIGHT_MIN = 40;
export const HEIGHT_MAX = 500;
export const CM_TO_PX = 10;
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 4;
export const SAFE_AREA_MM = 30;

export const STANDARD_WIDTHS = [40, 60, 75, 85, 115, 150, 200];
export const STANDARD_HEIGHTS = [40, 60, 75, 85, 115, 150, 200];

export const DEFAULT_CONFIG: ProductConfig = {
  baseColor: PRINT_PALETTE[0].code,
  edge: true,
  flameRetardant: false,
  form: "eckig",
  format: "standard",
  widthCm: DEFAULT_WIDTH_CM,
  heightCm: DEFAULT_HEIGHT_CM,
  delivery: "standard",
  quantity: 1,
  zoom: 1,
};

export const BASE_COLOR_SWATCHES = PRINT_PALETTE.map((c) => c.code);

export const FONT_CHOICES = [
  "Arial",
  "Helvetica",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Impact",
  "Comic Sans MS",
  "Arial Black",
  "Palatino",
  "Bookman",
  "Gill Sans",
  "Century Gothic",
  "Futura",
  "Futura PT",
  "Avant Garde",
  "Rockwell",
  "Cooper Black",
  "Bebas Neue",
  "Montserrat",
  "Oswald",
  "Roboto",
  "Lato",
  "Open Sans",
  "Raleway",
  "PT Sans",
  "Source Sans Pro",
  "Noto Sans",
  "Exo 2",
  "Archivo",
  "Work Sans",
  "IBM Plex Sans",
  "Space Grotesk",
  "Ubuntu",
  "Poppins",
  "Nunito",
  "Quicksand",
  "Comfortaa",
  "Pacifico",
  "Lobster",
  "Caveat",
  "Dancing Script",
  "Great Vibes",
  "Playfair Display",
  "Bodoni Moda",
  "Cormorant",
  "Libre Baskerville",
  "Merriweather",
  "Roboto Slab",
  "Playfair Display SC",
  "Press Start 2P",
  "Special Elite",
  "VT323",
  "Audiowide",
  "Orbitron",
  "Monoton",
  "Righteous",
  "Satisfy",
  "Sacramento",
  "Bangers",
  "Cinzel",
  "Amatic SC",
  "Kaushan Script",
  "Yellowtail",
  "Permanent Marker",
  "Bowlby One",
  "Fredoka One",
  "Baloo 2",
  "Chewy",
  "Miltonian",
  "Griffy",
] as const;

export const TEXT_SIZE_LADDER = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 84, 96, 120, 150, 180, 220, 260] as const;

interface DesignerState {
  config: ProductConfig;
  objects: DesignObject[];
  selectedId: string | null;
  past: DesignObject[][];
  future: DesignObject[][];
  cartCount: number;
  toast: string | null;
}

type Action =
  | { type: "UPDATE_CONFIG"; patch: Partial<ProductConfig> }
  | { type: "ADD_OBJECT"; object: DesignObject }
  | { type: "UPDATE_OBJECT"; id: string; patch: Partial<DesignObject> }
  | { type: "UPDATE_OBJECTS"; objects: DesignObject[] }
  | { type: "REMOVE_OBJECT"; id: string }
  | { type: "SELECT_OBJECT"; id: string | null }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_HISTORY" }
  | { type: "ADD_TO_CART" }
  | { type: "SHOW_TOAST"; message: string }
  | { type: "HIDE_TOAST" };

let idCounter = 0;
export function uid(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

const HISTORY_LIMIT = 50;

function pushHistory(
  state: DesignerState,
  next: Partial<DesignerState>,
): DesignerState {
  const past = [...state.past, state.objects.map((o) => ({ ...o }))];
  if (past.length > HISTORY_LIMIT) past.shift();
  return { ...state, ...next, past, future: [] };
}

function reducer(state: DesignerState, action: Action): DesignerState {
  switch (action.type) {
    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.patch } };
    case "ADD_OBJECT":
      return pushHistory(state, {
        objects: [...state.objects, action.object],
      });
    case "UPDATE_OBJECT":
      return pushHistory(state, {
        objects: state.objects.map((o) =>
          o.id === action.id ? { ...o, ...action.patch } : o,
        ),
      });
    case "UPDATE_OBJECTS":
      return pushHistory(state, { objects: action.objects });
    case "REMOVE_OBJECT":
      return pushHistory(state, {
        objects: state.objects.filter((o) => o.id !== action.id),
      });
    case "SELECT_OBJECT":
      return { ...state, selectedId: action.id };
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const past = state.past.slice(0, -1);
      const future = [state.objects.map((o) => ({ ...o })), ...state.future];
      return { ...state, objects: previous, past, future };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const future = state.future.slice(1);
      const past = [...state.past, state.objects.map((o) => ({ ...o }))];
      return { ...state, objects: next, past, future };
    }
    case "CLEAR_HISTORY":
      return { ...state, past: [], future: [] };
    case "ADD_TO_CART":
      return {
        ...state,
        cartCount: state.cartCount + 1,
        toast: `Added to cart (${state.cartCount + 1} item${
          state.cartCount + 1 > 1 ? "s" : ""
        })`,
      };
    case "SHOW_TOAST":
      return { ...state, toast: action.message };
    case "HIDE_TOAST":
      return { ...state, toast: null };
    default:
      return state;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PriceBreakdown {
  areaSqm: number;
  pricePerSqm: number;
  areaNet: number;
  fireSurcharge: number;
  unitNet: number;
  subtotal: number;
  vat: number;
  total: number;
}

export function computePrice(
  config: ProductConfig,
  objectCount: number,
): PriceBreakdown {
  const areaSqm = (config.widthCm * config.heightCm) / 10000;
  let pricePerSqm = objectCount > 0 ? 110 : 100;
  if (config.form === "rund") pricePerSqm = 149;
  const areaNet = round2(areaSqm * pricePerSqm);
  const fireSurcharge = config.flameRetardant ? FLAME_SURCHARGE : 0;
  const unitNet = round2(areaNet + fireSurcharge);
  const subtotal = round2(unitNet * config.quantity);
  const vat = round2(subtotal * VAT_RATE);
  const total = round2(subtotal * (1 + VAT_RATE));
  return { areaSqm, pricePerSqm, areaNet, fireSurcharge, unitNet, subtotal, vat, total };
}

export function layerName(obj: DesignObject, objects: DesignObject[]): string {
  const typeName: Record<DesignObject["type"], string> = {
    rect: "Form",
    circle: "Icon",
    star: "Icon",
    triangle: "Icon",
    heart: "Icon",
    bolt: "Icon",
    moon: "Icon",
    arrow: "Icon",
    cross: "Icon",
    text: "Text",
    line: "Linie",
    image: "Bild",
  };
  const base = typeName[obj.type] ?? "Element";
  const index = objects.filter((o, i) => i < objects.indexOf(obj) && typeName[o.type] === base).length + 1;
  return `${base} ${index}`;
}

export function unassignedObjects(objects: DesignObject[]): DesignObject[] {
  return objects.filter((o) => !o.printColor);
}

interface DesignerContextValue {
  config: ProductConfig;
  objects: DesignObject[];
  selectedId: string | null;
  cartCount: number;
  toast: string | null;
  updateConfig: (patch: Partial<ProductConfig>) => void;
  addObject: (object: Omit<DesignObject, "id">) => void;
  updateObject: (id: string, patch: Partial<DesignObject>) => void;
  updateObjects: (objects: DesignObject[]) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  addToCart: () => void;
  showToast: (message: string) => void;
}

const DesignerContext = createContext<DesignerContextValue | null>(null);

export function DesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    config: DEFAULT_CONFIG,
    objects: [],
    selectedId: null,
    past: [],
    future: [],
    cartCount: 0,
    toast: null,
  });

  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 2400);
    return () => clearTimeout(timer);
  }, [state.toast]);

  const updateConfig = useCallback(
    (patch: Partial<ProductConfig>) =>
      dispatch({ type: "UPDATE_CONFIG", patch }),
    [],
  );
  const addObject = useCallback(
    (object: Omit<DesignObject, "id">) =>
      dispatch({ type: "ADD_OBJECT", object: { ...object, id: uid() } }),
    [],
  );
  const updateObject = useCallback(
    (id: string, patch: Partial<DesignObject>) =>
      dispatch({ type: "UPDATE_OBJECT", id, patch }),
    [],
  );
  const updateObjects = useCallback(
    (objects: DesignObject[]) => dispatch({ type: "UPDATE_OBJECTS", objects }),
    [],
  );
  const removeObject = useCallback(
    (id: string) => dispatch({ type: "REMOVE_OBJECT", id }),
    [],
  );
  const selectObject = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_OBJECT", id }),
    [],
  );
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const clearHistory = useCallback(() => dispatch({ type: "CLEAR_HISTORY" }), []);
  const addToCart = useCallback(() => dispatch({ type: "ADD_TO_CART" }), []);
  const showToast = useCallback(
    (message: string) => dispatch({ type: "SHOW_TOAST", message }),
    [],
  );

  const value = useMemo<DesignerContextValue>(
    () => ({
      config: state.config,
      objects: state.objects,
      selectedId: state.selectedId,
      cartCount: state.cartCount,
      toast: state.toast,
      updateConfig,
      addObject,
      updateObject,
      updateObjects,
      removeObject,
      selectObject,
      undo,
      redo,
      clearHistory,
      addToCart,
      showToast,
    }),
    [
      state.config,
      state.objects,
      state.selectedId,
      state.cartCount,
      state.toast,
      updateConfig,
      addObject,
      updateObject,
      updateObjects,
      removeObject,
      selectObject,
      undo,
      redo,
      clearHistory,
      addToCart,
      showToast,
    ],
  );

  return (
    <DesignerContext.Provider value={value}>
      {children}
    </DesignerContext.Provider>
  );
}

export function useDesigner(): DesignerContextValue {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerProvider");
  }
  return context;
}