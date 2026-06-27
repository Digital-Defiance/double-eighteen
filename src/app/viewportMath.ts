/** Pan/zoom transform: content is scaled by `scale` then translated by (x, y). */
export interface ViewportTransform {
  scale: number;
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export function clampScale(scale: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, scale));
}

/**
 * Zooms by `factor` about a fixed screen `pivot` so the content point under the
 * pivot stays put. Scale is clamped to [min, max]; the translation is adjusted
 * by the *effective* factor after clamping so panning can't drift at the limits.
 */
export function zoomAt(
  view: ViewportTransform,
  factor: number,
  pivot: Point,
  min: number,
  max: number
): ViewportTransform {
  const scale = clampScale(view.scale * factor, min, max);
  const effective = scale / view.scale;
  return {
    scale,
    x: pivot.x - (pivot.x - view.x) * effective,
    y: pivot.y - (pivot.y - view.y) * effective,
  };
}

/**
 * Centers `content` within `viewport` at the largest scale that fits inside the
 * given padding (clamped to [min, max]). Use this for a "fit / reset" control.
 */
export function fitToBounds(
  content: Size,
  viewport: Size,
  padding: number,
  min: number,
  max: number
): ViewportTransform {
  const safeW = Math.max(1, content.width);
  const safeH = Math.max(1, content.height);
  const raw = Math.min(
    (viewport.width - padding * 2) / safeW,
    (viewport.height - padding * 2) / safeH
  );
  const scale = clampScale(raw, min, max);
  return {
    scale,
    x: (viewport.width - safeW * scale) / 2,
    y: (viewport.height - safeH * scale) / 2,
  };
}

/** Converts a screen point inside the viewport to content coordinates. */
export function screenToContent(view: ViewportTransform, screen: Point): Point {
  return {
    x: (screen.x - view.x) / view.scale,
    y: (screen.y - view.y) / view.scale,
  };
}
