import { FC } from 'react';
import { PipGridSize, resolvePipPosition } from './pipGrid';

export interface PipProps {
  row: number;
  col: number;
  gridSize: PipGridSize;
  color: string;
  hollow?: boolean;
  top?: string;
  left?: string;
}

export const Pip: FC<PipProps> = ({
  row,
  col,
  gridSize,
  color,
  hollow,
  top,
  left,
}) => {
  const positionStyle = resolvePipPosition({ row, col, gridSize, top, left });

  return (
    <div
      data-testid="pip"
      data-row={row}
      data-col={col}
      data-grid={gridSize}
      style={{
        position: 'absolute',
        backgroundColor: hollow ? 'transparent' : color,
        border: hollow ? '2px solid #888' : undefined,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: hollow ? undefined : '1px 2px 3px rgba(0,0,0,0.3)',
        ...positionStyle,
      }}
    />
  );
};

export default Pip;
