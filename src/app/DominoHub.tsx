import { FC } from 'react';
import { DominoTrain } from '@/app/DominoTrain';
import { DoubleTwelve } from '@/app/DoubleTwelve';
import { TrainData } from '@/game/TrainData';
import { PipColorMap } from '@/app/pipColors';

interface DominoHubProps {
  playerCount: number;
  centerX: number;
  centerY: number;
  radius: number;
  engineValue: number;
  trains: TrainData[];
  layoutStyle: 'offset' | 'linear';
  tableWidth: number;
  tableHeight: number;
  pipColors?: PipColorMap;
}

/**
 * Distance from the hub center at which a train should start so its first tile
 * clears its neighbours. Trains fan out 360/slots° apart, so the neighbour gap
 * at distance d is ~2πd/slots; it must exceed a tile's footprint. Offset trains
 * zigzag wider (a perpendicular half-tile seed) and need a bigger ring; linear
 * trains are skinny and stay near the hub. Never smaller than `radius + 20`.
 */
export function hubTrainStartDistance(
  slots: number,
  radius: number,
  dominoWidth: number,
  layoutStyle: 'offset' | 'linear'
): number {
  const minNeighborGap = dominoWidth * (layoutStyle === 'offset' ? 2.5 : 1.3);
  return Math.max(radius + 20, Math.ceil((minNeighborGap * slots) / (2 * Math.PI)));
}

export const DominoHub: FC<DominoHubProps> = ({
  playerCount,
  centerX,
  centerY,
  radius,
  engineValue,
  trains,
  layoutStyle,
  tableWidth,
  tableHeight,
  pipColors,
}) => {
  // Ensure we have at least 8 player slots
  const slots = Math.max(8, playerCount);
  const hubSize = 120; // Increased to fit the standard domino size
  const dominoWidth = 60;
  const dominoHeight = 120; // Standard domino size to match the rest of the dominoes

  const startDistance = hubTrainStartDistance(slots, radius, dominoWidth, layoutStyle);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Central hub */}
      <div
        style={{
          position: 'absolute',
          width: `${hubSize}px`,
          height: `${hubSize}px`,
          left: `${centerX - hubSize / 2}px`,
          top: `${centerY - hubSize / 2}px`,
          backgroundColor: '#d1d5db',
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: '#6b7280',
          borderRadius: '50%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Engine domino in the center */}
        <div style={{ transform: 'rotate(0deg)' }}>
          <DoubleTwelve
            value1={engineValue}
            value2={engineValue}
            width={dominoWidth}
            height={dominoHeight}
            backgroundColor="white"
            pipColor="black"
            pipColors={pipColors}
            borderColor="#333"
          />
        </div>
      </div>

      {/* Trains radiating from hub */}
      {Array.from({ length: slots }).map((_, index) => {
        const angle = (index * 360) / slots;
        const radians = (angle * Math.PI) / 180;

        // Calculate starting point for the train
        const startX = centerX + startDistance * Math.cos(radians);
        const startY = centerY + startDistance * Math.sin(radians);

        // Get train data for this position (if exists)
        const trainData = trains.find((t) => t.playerId === index) || {
          dominoes: [],
          playerId: index,
          isPublic: false,
        };

        return (
          <DominoTrain
            key={index}
            startX={startX}
            startY={startY}
            angle={angle}
            trainData={trainData}
            layoutStyle={layoutStyle}
            tableWidth={tableWidth}
            tableHeight={tableHeight}
            centerX={centerX}
            centerY={centerY}
            pipColors={pipColors}
          />
        );
      })}
    </div>
  );
};

export default DominoHub;
