let captureFn: (() => void) | null = null;

export function registerCapture(fn: () => void) {
  captureFn = fn;
}

export function unregisterCapture() {
  captureFn = null;
}

export function captureCanvas(): boolean {
  if (captureFn) {
    captureFn();
    return true;
  }
  return false;
}