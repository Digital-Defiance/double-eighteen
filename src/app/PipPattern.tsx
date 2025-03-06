import { FC } from 'react';
import { Pip } from './Pip';
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
  const { color, hollow } = pipProps(value, pipColor, pipColors);
  const layout = getPipLayout(value);

  return (
    <>
      {layout.map((cell, index) => (
        <Pip
          key={index}
          row={cell.row}
          col={cell.col}
          gridSize={cell.gridSize}
          color={color}
          hollow={hollow}
          top={cell.top}
          left={cell.left}
        />
      ))}
    </>
  );
};

export default PipPattern;
