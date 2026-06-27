import { FC } from 'react';

import { DefaultPip } from './DefaultPip';
import { useDominoTheme } from './DominoThemeContext';
import type { PipRenderContext } from './dominoTheme';
import { resolvePipPosition } from './pipGrid';
import { getPipLayout } from './pipLayouts';
import { PipColorMap, resolvePipStyle } from './pipColors';

interface PipPatternProps {
  value: number;
  pipColor: string;
  pipColors?: PipColorMap;
}

const pipProps = (
  value: number,
  pipColor: string,
  pipColors?: PipColorMap
): { color: string; hollow?: boolean } => {
  const style = resolvePipStyle(value, pipColors);
  if (style) {
    return { color: style.color, hollow: style.hollow };
  }
  return { color: pipColor };
};

export const PipPattern: FC<PipPatternProps> = ({
  value,
  pipColor,
  pipColors,
}) => {
  const theme = useDominoTheme();
  const { color, hollow } = pipProps(value, pipColor, pipColors);
  const layout = getPipLayout(value);

  return (
    <>
      {layout.map((cell, index) => {
        const ctx: PipRenderContext = {
          value,
          row: cell.row,
          col: cell.col,
          gridSize: cell.gridSize,
          color,
          hollow,
          top: cell.top,
          left: cell.left,
          positionStyle: resolvePipPosition(cell),
        };

        if (theme.renderPip) {
          return <span key={index}>{theme.renderPip(ctx)}</span>;
        }

        return <DefaultPip key={index} ctx={ctx} theme={theme} />;
      })}
    </>
  );
};

export default PipPattern;
