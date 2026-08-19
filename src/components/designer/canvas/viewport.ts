export const viewport = {
  width: 836,
  height: 519,
};

export function updateViewport(width: number, height: number) {
  if (width > 0 && height > 0) {
    viewport.width = width;
    viewport.height = height;
  }
}