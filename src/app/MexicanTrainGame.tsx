import { FC, useState, useEffect } from 'react';
import { DominoHub } from './DominoHub';
import { GameState } from '@/game/GameState';
import { generateSampleTrains } from '@/game/generateSampleTrains';
import { DEFAULT_PIP_COLORS, PipColorMap } from './pipColors';

interface MexicanTrainGameProps {
  initialState?: GameState;
  width?: number;
  height?: number;
  pipColors?: PipColorMap;
  onPipColorsChange?: (pipColors: PipColorMap | undefined) => void;
}

const defaultGameState: GameState = {
  playerCount: 8,
  trains: [],
  engineValue: 12,
};

export const MexicanTrainGame: FC<MexicanTrainGameProps> = ({
  initialState = defaultGameState,
  width = 1200,
  height = 800,
  pipColors: pipColorsProp,
  onPipColorsChange,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [layoutStyle, setLayoutStyle] = useState<'offset' | 'linear'>('offset');
  const [chickenFeet, setChickenFeet] = useState(false);
  const [pipColorsInternal, setPipColorsInternal] = useState<
    PipColorMap | undefined
  >(undefined);
  const pipColors = pipColorsProp ?? pipColorsInternal;
  const setPipColors = onPipColorsChange ?? setPipColorsInternal;
  const pipColorsEnabled = pipColors !== undefined;

  // Center coordinates for the hub
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate sample data for better visualization
  const regenerateTrains = (chickenFeetEnabled = chickenFeet) => {
    const sampleTrains = generateSampleTrains(
      gameState.playerCount,
      gameState.engineValue,
      { chickenFeet: chickenFeetEnabled }
    );
    setGameState((prevState) => ({
      ...prevState,
      trains: sampleTrains,
    }));
  };

  useEffect(() => {
    regenerateTrains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleChickenFeet = () => {
    const next = !chickenFeet;
    setChickenFeet(next);
    regenerateTrains(next);
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        backgroundColor: '#1f8a55', // Classic green felt background
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}
      >
        <button
          onClick={() => regenerateTrains()}
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          New trains
        </button>
        <button
          onClick={() =>
            setLayoutStyle(layoutStyle === 'offset' ? 'linear' : 'offset')
          }
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          Layout: {layoutStyle === 'offset' ? 'Offset' : 'Linear'}
        </button>
        <button
          onClick={toggleChickenFeet}
          style={{
            padding: '8px 12px',
            backgroundColor: chickenFeet ? '#fef3c7' : '#fff',
            border: `1px solid ${chickenFeet ? '#f59e0b' : '#ccc'}`,
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          Chicken Feet: {chickenFeet ? 'On' : 'Off'}
        </button>
        <button
          onClick={() =>
            setPipColors(pipColorsEnabled ? undefined : DEFAULT_PIP_COLORS)
          }
          style={{
            padding: '8px 12px',
            backgroundColor: pipColorsEnabled ? '#fef3c7' : '#fff',
            border: `1px solid ${pipColorsEnabled ? '#f59e0b' : '#ccc'}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Pip Colors: {pipColorsEnabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Game information */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 100,
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
      >
        <div>Engine: Double-{gameState.engineValue}</div>
        <div>Players: {gameState.playerCount}</div>
      </div>

      <DominoHub
        playerCount={gameState.playerCount}
        centerX={centerX}
        centerY={centerY}
        radius={80}
        engineValue={gameState.engineValue}
        trains={gameState.trains}
        layoutStyle={layoutStyle}
        tableWidth={width}
        tableHeight={height}
        pipColors={pipColors}
      />
    </div>
  );
};

export default MexicanTrainGame;
