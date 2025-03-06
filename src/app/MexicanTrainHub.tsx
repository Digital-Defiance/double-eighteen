import { FC } from 'react';
import { DoubleTwelve } from './DoubleTwelve';

interface MexicanTrainHubProps {
  centerX: number;
  centerY: number;
  radius: number;
  numberOfDominoes: number;
}

export const MexicanTrainHub: FC<MexicanTrainHubProps> = ({
  centerX,
  centerY,
  radius,
  numberOfDominoes,
}) => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '500px' }}>
      {/* Central hub */}
      <div
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          left: `${centerX - 40}px`,
          top: `${centerY - 40}px`,
          backgroundColor: '#d1d5db',
          borderWidth: '4px',
          borderStyle: 'solid',
          borderColor: '#6b7280',
          borderRadius: '50%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      />

      {/* Radiating dominoes */}
      {Array.from({ length: numberOfDominoes }).map((_, index) => {
        const angle = (index * 360) / numberOfDominoes;
        const radians = (angle * Math.PI) / 180;

        // Calculate position to place domino's center at the desired distance from hub
        // Add half the domino width to radius to start at the edge of the hub
        const distance = radius + 50;

        // Calculate position based on angle and distance
        const x = centerX + distance * Math.cos(radians);
        const y = centerY + distance * Math.sin(radians);

        // For radiating outward, the domino's rotation is the same as the angle
        // Plus 90 degrees to make it perpendicular to the radius
        const dominoRotation = angle + 90;

        // Adjust position to account for the domino's center
        const adjustedX = x - 50;
        const adjustedY = y - 100;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
            }}
          >
            <DoubleTwelve
              value1={Math.floor(Math.random() * 13)}
              value2={Math.floor(Math.random() * 13)}
              rotation={dominoRotation}
              width={100}
              height={200}
              backgroundColor="white"
              pipColor="black"
              borderColor="black"
            />
          </div>
        );
      })}
    </div>
  );
};

export default MexicanTrainHub;
