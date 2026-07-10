export interface PipColorStyle {
  color: string;
  hollow?: boolean;
}

/** Partial map of domino values (0–18) to pip styles. */
export type PipColorMap = Partial<Record<number, PipColorStyle>>;

/** Standard double-18 domino pip colors by value. */
export const DEFAULT_PIP_COLORS: PipColorMap = {
  0: { color: 'transparent' },
  1: { color: '#1a1a1a' },
  2: { color: '#8B1A1A' },
  3: { color: '#E6B800' },
  4: { color: '#e8e8e8', hollow: true },
  5: { color: '#2E8B57' },
  6: { color: '#2563EB' },
  7: { color: '#E8A87C' },
  8: { color: '#DC2626' },
  9: { color: '#1E3A8A' },
  10: { color: '#EA580C' },
  11: { color: '#166534' },
  12: { color: '#DC2626' },
  13: { color: '#F472B6' },
  14: { color: '#64748B' },
  15: { color: '#7C3AED' },
  16: { color: '#F59E0B' },
  17: { color: '#78350F' },
  18: { color: '#14532D' },
};

/** @deprecated Use DEFAULT_PIP_COLORS instead. */
export const PIP_COLORS = DEFAULT_PIP_COLORS;

/** Merge custom overrides onto the default double-18 color set. */
export function mergePipColors(overrides?: PipColorMap): PipColorMap {
  return { ...DEFAULT_PIP_COLORS, ...overrides };
}

/** Resolve the pip style for a value when colored pips are enabled. */
export function resolvePipStyle(
  value: number,
  pipColors?: PipColorMap
): PipColorStyle | undefined {
  if (pipColors === undefined) {
    return undefined;
  }

  return (
    pipColors[value] ??
    DEFAULT_PIP_COLORS[value] ?? { color: '#1a1a1a' }
  );
}

/** @deprecated Use resolvePipStyle instead. */
export function getPipStyle(value: number): PipColorStyle {
  return resolvePipStyle(value, DEFAULT_PIP_COLORS)!;
}
