import { FC } from 'react';
import { PipPattern } from './PipPattern';
import { PipColorMap } from './pipColors';

interface DominoHalfProps {
  value: number;
  pipColor: string;
  pipColors?: PipColorMap;
}

export const DominoHalf: FC<DominoHalfProps> = ({
  value,
  pipColor,
  pipColors,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        padding: '0',
        overflow: 'hidden',
      }}
    >
      <PipPattern value={value} pipColor={pipColor} pipColors={pipColors} />
    </div>
  );
};

export default DominoHalf;
