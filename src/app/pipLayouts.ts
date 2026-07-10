import { PIP_LAYOUTS as CLASSIC_LAYOUTS } from './pipLayouts/classic';
import { HIGH_VALUE_LAYOUTS } from './pipLayouts/highValue';

/** Canonical pip layouts for values 0–18. */
export const PIP_LAYOUTS: Record<number, readonly import('./pipGrid').PipLayoutCell[]> =
  {
    ...CLASSIC_LAYOUTS,
    ...HIGH_VALUE_LAYOUTS,
  };

export { CLASSIC_LAYOUTS };
export { HIGH_VALUE_LAYOUTS, buildHighValueLayout } from './pipLayouts/highValue';

export function getPipLayout(value: number): readonly import('./pipGrid').PipLayoutCell[] {
  return PIP_LAYOUTS[value] ?? [];
}
