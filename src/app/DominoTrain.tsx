import { FC, useMemo } from 'react';
import { DoubleTwelve } from '@/app/DoubleTwelve';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  computeTrainTree,
  flattenSegments,
} from '@/app/trainLayout';
import { TrainData } from '@/game/TrainData';
import { PipColorMap } from '@/app/pipColors';

interface DominoTrainProps {
  startX: number;
  startY: number;
  angle: number;
  trainData: TrainData;
  layoutStyle: 'offset' | 'linear';
  tableWidth: number;
  tableHeight: number;
  centerX: number;
  centerY: number;
  pipColors?: PipColorMap;
}

export const DominoTrain: FC<DominoTrainProps> = ({
  startX,
  startY,
  angle,
  trainData,
  layoutStyle,
  tableWidth,
  tableHeight,
  centerX,
  centerY,
  pipColors,
}) => {
  const trainLayout = useMemo(
    () =>
      flattenSegments(
        computeTrainTree({
          startX,
          startY,
          angle,
          branch: { dominoes: trainData.dominoes, feet: trainData.feet },
          layoutStyle,
        })
      ),
    [
      startX,
      startY,
      angle,
      trainData.dominoes,
      trainData.feet,
      layoutStyle,
      tableWidth,
      tableHeight,
    ]
  );

  return (
    <>
      {trainLayout.map((entry, index) => {
        const showMarker = trainData.isPublic;

        return (
          <div
            key={`main-train-${trainData.playerId}-${index}`}
            style={{
              position: 'absolute',
              left: `${entry.x - DOMINO_WIDTH / 2}px`,
              top: `${entry.y - DOMINO_HEIGHT / 2}px`,
              zIndex: 5,
            }}
          >
            <DoubleTwelve
              value1={entry.value1}
              value2={entry.value2}
              width={DOMINO_WIDTH}
              height={DOMINO_HEIGHT}
              backgroundColor="white"
              pipColor="black"
              pipColors={pipColors}
              borderColor={showMarker ? 'red' : 'black'}
              rotation={entry.rotation}
            />
          </div>
        );
      })}
    </>
  );
};

export default DominoTrain;
