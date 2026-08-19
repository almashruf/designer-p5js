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
import { DESIGNER_COLORS } from "../designerTokens";

export type Form = "square" | "around";
export type Format = "standard" | "wish";

export interface ProductConfig {
  baseColor: string;
  edge: boolean;
  flameRetardant: boolean;
  form: Form;
  format: Format;
  widthCm: number;
  heightCm: number;
  quantity: number;
  zoom: number;
}

export interface DesignObject {
  id: string;
  type: "rect" | "circle" | "star" | "triangle" | "text" | "line" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  text?: string;
  imageData?: string;
}

export const DEFAULT_WIDTH_CM = 60;
export const DEFAULT_HEIGHT_CM = 40;
export const BASE_UNIT_PRICE = 24;
export const FLAME_SURCHARGE = 45;
export const VAT_RATE = 0.19;
export const WIDTH_MIN = 40;
export const WIDTH_MAX = 200;
export const HEIGHT_MIN = 40;
export const HEIGHT_MAX = 500;
export const CM_TO_PX = 10;
export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 3;

export const DEFAULT_CONFIG: ProductConfig = {
  baseColor: DESIGNER_COLORS.product,
  edge: true,
  flameRetardant: false,
  form: "square",
  format: "standard",
  widthCm: DEFAULT_WIDTH_CM,
  heightCm: DEFAULT_HEIGHT_CM,
  quantity: 1,
  zoom: 1,
};

export const BASE_COLOR_SWATCHES = [
  "#FFFFFF",
  "#f8fafc",
  "#e5e7eb",
  "#9ca3af",
  "#3f3f46",
  "#1f2937",
  "#111827",
  "#dc2626",
  "#ea580c",
  "#f59e0b",
  "#16a34a",
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

interface DesignerState {
  config: ProductConfig;
  objects: DesignObject[];
  cartCount: number;
  toast: string | null;
}

type Action =
  | { type: "UPDATE_CONFIG"; patch: Partial<ProductConfig> }
  | { type: "ADD_OBJECT"; object: DesignObject }
  | { type: "UPDATE_OBJECT"; id: string; patch: Partial<DesignObject> }
  | { type: "UPDATE_OBJECTS"; objects: DesignObject[] }
  | { type: "REMOVE_OBJECT"; id: string }
  | { type: "ADD_TO_CART" }
  | { type: "SHOW_TOAST"; message: string }
  | { type: "HIDE_TOAST" };

let idCounter = 0;
export function uid(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

function reducer(state: DesignerState, action: Action): DesignerState {
  switch (action.type) {
    case "UPDATE_CONFIG":
      return { ...state, config: { ...state.config, ...action.patch } };
    case "ADD_OBJECT":
      return { ...state, objects: [...state.objects, action.object] };
    case "UPDATE_OBJECT":
      return {
        ...state,
        objects: state.objects.map((o) =>
          o.id === action.id ? { ...o, ...action.patch } : o,
        ),
      };
    case "UPDATE_OBJECTS":
      return { ...state, objects: action.objects };
    case "REMOVE_OBJECT":
      return {
        ...state,
        objects: state.objects.filter((o) => o.id !== action.id),
      };
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
  areaPrice: number;
  unitNet: number;
  subtotal: number;
  vat: number;
  total: number;
}

export function computePrice(config: ProductConfig): PriceBreakdown {
  const areaFactor =
    (config.widthCm * config.heightCm) / (DEFAULT_WIDTH_CM * DEFAULT_HEIGHT_CM);
  const areaPrice = round2(BASE_UNIT_PRICE * areaFactor);
  const unitNet = round2(areaPrice + (config.flameRetardant ? FLAME_SURCHARGE : 0));
  const subtotal = round2(unitNet * config.quantity);
  const vat = round2(subtotal * VAT_RATE);
  const total = round2(subtotal * (1 + VAT_RATE));
  return { areaPrice, unitNet, subtotal, vat, total };
}

interface DesignerContextValue {
  config: ProductConfig;
  objects: DesignObject[];
  cartCount: number;
  toast: string | null;
  updateConfig: (patch: Partial<ProductConfig>) => void;
  addObject: (object: Omit<DesignObject, "id">) => void;
  updateObject: (id: string, patch: Partial<DesignObject>) => void;
  updateObjects: (objects: DesignObject[]) => void;
  removeObject: (id: string) => void;
  addToCart: () => void;
  showToast: (message: string) => void;
}

const DesignerContext = createContext<DesignerContextValue | null>(null);

export function DesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    config: DEFAULT_CONFIG,
    objects: [],
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
  const addToCart = useCallback(() => dispatch({ type: "ADD_TO_CART" }), []);
  const showToast = useCallback(
    (message: string) => dispatch({ type: "SHOW_TOAST", message }),
    [],
  );

  const value = useMemo<DesignerContextValue>(
    () => ({
      config: state.config,
      objects: state.objects,
      cartCount: state.cartCount,
      toast: state.toast,
      updateConfig,
      addObject,
      updateObject,
      updateObjects,
      removeObject,
      addToCart,
      showToast,
    }),
    [
      state.config,
      state.objects,
      state.cartCount,
      state.toast,
      updateConfig,
      addObject,
      updateObject,
      updateObjects,
      removeObject,
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