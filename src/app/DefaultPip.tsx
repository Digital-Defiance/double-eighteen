import { FC } from 'react';

import type { PipRenderContext } from './dominoTheme';
import type { DominoTheme } from './dominoTheme';

export interface DefaultPipProps {
  ctx: PipRenderContext;
  theme?: DominoTheme;
}

/** Stock domino pip — solid or hollow circle using the resolved pip color. */
export const DefaultPip: FC<DefaultPipProps> = ({ ctx, theme }) => {
  const { row, col, gridSize, color, hollow, positionStyle } = ctx;
  const themed = theme?.pipStyle?.(ctx) ?? {};

  return (
    <div
      data-testid="pip"
      data-row={row}
      data-col={col}
      data-grid={gridSize}
      data-pip-value={ctx.value}
      data-hollow={hollow ? 'true' : undefined}
      style={{
        position: 'absolute',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: hollow ? 'transparent' : color,
        border: hollow ? `2px solid ${color}` : undefined,
        boxShadow: hollow ? undefined : '1px 2px 3px rgba(0,0,0,0.3)',
        ...positionStyle,
        ...themed,
      }}
    />
  );
};

export default DefaultPip;
