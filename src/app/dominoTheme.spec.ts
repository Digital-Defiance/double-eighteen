import { describe, expect, it } from 'vitest';

import { mergeDominoTheme, DEFAULT_DOMINO_THEME } from './dominoTheme';

describe('mergeDominoTheme', () => {
  it('merges tile data attributes without dropping parent keys', () => {
    const merged = mergeDominoTheme(
      {
        tileClassName: 'parent',
        tileDataAttributes: { variant: 'table' },
      },
      {
        tileDataAttributes: { holographic: true },
      }
    );

    expect(merged.tileClassName).toBe('parent');
    expect(merged.tileDataAttributes).toEqual({
      variant: 'table',
      holographic: true,
    });
  });

  it('returns defaults when patch is omitted', () => {
    expect(mergeDominoTheme(DEFAULT_DOMINO_THEME)).toBe(DEFAULT_DOMINO_THEME);
  });
});
