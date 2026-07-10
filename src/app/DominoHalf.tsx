import { FC } from 'react';
import { PipPattern } from './PipPattern';
import { PipColorMap } from './pipColors';

interface DominoHalfProps {
  value: number;
  pipColor: string;
  pipColors?: PipColorMap;
  /**
   * When true, rotate this half 180° so the far end of a tile mirrors the near
   * end (standard domino convention). Required for asymmetric faces (13–15).
   */
  rotated?: boolean;
  /** Which end of the tile this half is: 1 = value1, 2 = value2. */
  half?: 1 | 2;
}

export const DominoHalf: FC<DominoHalfProps> = ({
  value,
  pipColor,
  pipColors,
  rotated = false,
  half,
}) => {
  return (
    <div
      data-testid="domino-half"
      data-half={half}
      data-rotated={rotated ? 'true' : 'false'}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        padding: '0',
        overflow: 'hidden',
        ...(rotated
          ? {
              transform: 'rotate(180deg)',
              transformOrigin: 'center center',
            }
          : null),
      }}
    >
      <PipPattern value={value} pipColor={pipColor} pipColors={pipColors} />
    </div>
  );
};

export default DominoHalf;
