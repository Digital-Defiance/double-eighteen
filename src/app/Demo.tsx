import { FC, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DominoTile } from './DominoSetPresets';
import { MexicanTrainGame } from './MexicanTrainGame';
import { SetPicker } from './harness/SetPicker';
import { DEFAULT_PIP_COLORS, PipColorMap } from './pipColors';
import { normalizeSetSize } from '@/variants';

export const DominoDemo: FC = () => {
  const [searchParams] = useSearchParams();
  const setSize = normalizeSetSize(
    Number(searchParams.get('set') ?? undefined)
  );
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

      <SetPicker currentSet={setSize} basePath="/" />

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
            key={setSize}
            width={1200}
            height={1000}
            pipColors={pipColors}
            onPipColorsChange={setPipColors}
            initialState={{
              playerCount: 8,
              trains: [],
              engineValue: setSize,
            }}
          />
        </div>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
          Use the controls in the top-left to switch layout styles, regenerate
          trains, and toggle chicken feet. Red borders indicate public trains.
          Switch the set above to play with double-{setSize} tiles.
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
              Engine &amp; high doubles
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <DominoTile
                value1={setSize}
                value2={setSize}
                maxPips={setSize}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              {setSize >= 15 && (
                <>
                  <DominoTile
                    value1={15}
                    value2={15}
                    maxPips={setSize}
                    height={200}
                    width={100}
                    borderColor="black"
                    pipColor="black"
                    pipColors={pipColors}
                    backgroundColor="white"
                    rotation={0}
                  />
                  <DominoTile
                    value1={16}
                    value2={16}
                    maxPips={setSize}
                    height={200}
                    width={100}
                    borderColor="black"
                    pipColor="black"
                    pipColors={pipColors}
                    backgroundColor="white"
                    rotation={0}
                  />
                </>
              )}
              {setSize >= 18 && (
                <>
                  <DominoTile
                    value1={17}
                    value2={17}
                    maxPips={setSize}
                    height={200}
                    width={100}
                    borderColor="black"
                    pipColor="black"
                    pipColors={pipColors}
                    backgroundColor="white"
                    rotation={0}
                  />
                  <DominoTile
                    value1={18}
                    value2={18}
                    maxPips={setSize}
                    height={200}
                    width={100}
                    borderColor="black"
                    pipColor="black"
                    pipColors={pipColors}
                    backgroundColor="white"
                    rotation={0}
                  />
                </>
              )}
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
              <DominoTile
                value1={3}
                value2={Math.min(9, setSize)}
                maxPips={setSize}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DominoTile
                value1={6}
                value2={Math.min(7, setSize)}
                maxPips={setSize}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              <DominoTile
                value1={Math.min(12, setSize)}
                value2={0}
                maxPips={setSize}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
                rotation={0}
              />
              {setSize >= 18 && (
                <DominoTile
                  value1={17}
                  value2={18}
                  maxPips={setSize}
                  height={200}
                  width={100}
                  borderColor="black"
                  pipColor="black"
                  pipColors={pipColors}
                  backgroundColor="white"
                  rotation={0}
                />
              )}
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
              <DominoTile
                value1={6}
                value2={6}
                maxPips={setSize}
                rotation={0}
                height={200}
                width={100}
                borderColor="black"
                pipColor="black"
                pipColors={pipColors}
                backgroundColor="white"
              />
              <DominoTile
                value1={6}
                value2={6}
                maxPips={setSize}
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
