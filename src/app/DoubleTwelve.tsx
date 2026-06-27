import { FC } from 'react';

import { useDominoTheme } from './DominoThemeContext';
import { DominoHalf } from './DominoHalf';
import type { DominoTheme, TileRenderContext } from './dominoTheme';
import { themeDataAttributes } from './dominoTheme';
import { PipColorMap } from './pipColors';

export interface DoubleTwelveProps {
  /** Pip count on the top half (0–12). Defaults to 0 (blank). */
  value1?: number;
  /** Pip count on the bottom half (0–12). Defaults to 0 (blank). */
  value2?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  /** Fallback pip color when pipColors is not set. */
  pipColor?: string;
  /** Per-value pip colors. Pass DEFAULT_PIP_COLORS or a custom/merged map. */
  pipColors?: PipColorMap;
  borderColor?: string;
  rotation?: number;
  /** Presentation overrides — also available via DominoThemeProvider. */
  theme?: DominoTheme;
}

export const DoubleTwelve: FC<DoubleTwelveProps> = ({
  value1 = 0,
  value2 = 0,
  width = 100,
  height = 200,
  backgroundColor = 'white',
  pipColor = 'black',
  pipColors,
  borderColor = 'black',
  rotation = 0,
  theme: themeOverride,
}) => {
  const theme = useDominoTheme(themeOverride);
  const val1 = Math.min(Math.max(value1, 0), 12);
  const val2 = Math.min(Math.max(value2, 0), 12);

  const tileCtx: TileRenderContext = {
    value1: val1,
    value2: val2,
    width,
    height,
    backgroundColor,
    borderColor,
    rotation,
  };

  const tileThemed = theme.tileStyle?.(tileCtx) ?? {};
  const dividerThemed = theme.halfDividerStyle?.(tileCtx) ?? {};

  return (
    <div
      className={theme.tileClassName}
      {...themeDataAttributes(theme.tileDataAttributes)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor,
        borderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: '10px',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...tileThemed,
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: borderColor,
          ...dividerThemed,
        }}
      >
        <DominoHalf value={val1} pipColor={pipColor} pipColors={pipColors} />
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
        }}
      >
        <DominoHalf value={val2} pipColor={pipColor} pipColors={pipColors} />
      </div>
    </div>
  );
};

export default DoubleTwelve;
