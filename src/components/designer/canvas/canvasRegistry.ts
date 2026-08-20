export type CaptureMode = "png" | "png8" | "svg" | "proof";

let captureFn: ((mode: CaptureMode) => void) | null = null;

export function registerCapture(fn: (mode: CaptureMode) => void) {
  captureFn = fn;
}

export function unregisterCapture() {
  captureFn = null;
}

export function captureCanvas(mode: CaptureMode = "png"): boolean {
  if (captureFn) {
    captureFn(mode);
    return true;
  }
  return false;
}