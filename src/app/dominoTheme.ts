import type { CSSProperties, ReactNode } from 'react';

import type { PipGridSize } from './pipGrid';

export interface PipRenderContext {
  value: number;
  row: number;
  col: number;
  gridSize: PipGridSize;
  color: string;
  hollow?: boolean;
  top?: string;
  left?: string;
  positionStyle: CSSProperties;
}

export interface TileRenderContext {
  value1: number;
  value2: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  rotation: number;
}

/** Optional presentation hooks for domino tiles and pips. */
export interface DominoTheme {
  /** Root class on each tile — use for app-specific CSS modules. */
  tileClassName?: string;
  /** Extra data attributes for CSS selectors, e.g. holographic toggles. */
  tileDataAttributes?: Record<string, string | boolean | number | undefined>;
  tileStyle?: (ctx: TileRenderContext) => CSSProperties;
  halfDividerStyle?: (ctx: TileRenderContext) => CSSProperties;
  /** Merged onto each pip after layout positioning. */
  pipStyle?: (ctx: PipRenderContext) => CSSProperties;
  /** Replace the default pip element entirely. */
  renderPip?: (ctx: PipRenderContext) => ReactNode;
}

export const DEFAULT_DOMINO_THEME: DominoTheme = {};

export function mergeDominoTheme(
  base: DominoTheme,
  patch?: DominoTheme
): DominoTheme {
  if (!patch) {
    return base;
  }

  return {
    ...base,
    ...patch,
    tileDataAttributes: {
      ...base.tileDataAttributes,
      ...patch.tileDataAttributes,
    },
  };
}

/** Convert theme tileDataAttributes to React data-* props. */
export function themeDataAttributes(
  attrs?: DominoTheme['tileDataAttributes']
): Record<string, string> {
  if (!attrs) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) {
      continue;
    }
    result[`data-${key}`] = value === true ? 'true' : String(value);
  }
  return result;
}
