import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { DoubleTwelve } from './DoubleTwelve';
import { MexicanTrainGame } from './MexicanTrainGame';
import { DEFAULT_PIP_COLORS, PipColorMap } from './pipColors';

export const DominoDemo: FC = () => {
  const [pipColors, setPipColors] = useState<PipColorMap | undefined>(
    undefined
  );
  const pipColorsEnabled = pipColors !== undefined;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f3f4f6' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          Mexican Train Dominoes Game
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/harness"
            style={{ fontSize: '14px', color: '#2563EB' }}
          >
            Harnesses
          </Link>
          <button
          onClick={() =>
            setPipColors(pipColorsEnabled ? undefined : DEFAULT_PIP_COLORS)
          }
          style={{
            padding: '8px 16px',
            backgroundColor: pipColorsEnabled ? '#fef3c7' : '#fff',
            border: `1px solid ${pipColorsEnabled ? '#f59e0b' : '#ccc'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Pip Colors: {pipColorsEnabled ? 'On' : 'Off'}
        </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}
        >
          Game Board
        </h2>
        <div
          style={{
            backgroundColor: '#dbeafe',
            padding: '16px',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'auto',
            maxWidth: '100%',
          }}
        >
          <MexicanTrainGame
            width={1200}
            height={1000}
            pipColors={pipColors}
            onPipColorsChange={setPipColors}
            initialState={{
              playerCount: 8,
              trains: [],
              engineValue: 12,
            }}
          />
        </div>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
          Use the controls in the top-left to switch layout styles. Toggle pip
          colors to match a standard double-12 set. Red borders indicate public
          trains that any player can play on.
        </p>
      </div>

      <div>
        <h2
          style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}
        >
          Domino Examples
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '32px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
              }}
            >
              Double Dominoes (0-3)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <DoubleTwelve
                value1={0}
                value2={0}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DoubleTwelve
                value1={1}
                value2={1}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DoubleTwelve
                value1={2}
                value2={2}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DoubleTwelve
                value1={3}
                value2={3}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
              }}
            >
              Mixed Values
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <DoubleTwelve
                value1={3}
                value2={9}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DoubleTwelve
                value1={6}
                value2={7}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DoubleTwelve
                value1={12}
                value2={0}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
              }}
            >
              Rotation Examples
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <DoubleTwelve
                value1={6}
                value2={6}
                rotation={0}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
              />
              <DoubleTwelve
                value1={6}
                value2={6}
                rotation={90}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DominoDemo;
