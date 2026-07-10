import { FC, CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DominoTile } from '@/app/DominoTile';
import { DEFAULT_PIP_COLORS } from '@/app/pipColors';
import { SetPicker } from '@/app/harness/SetPicker';
import {
  doubleFixtures,
  mixedFixtures,
  parseSetParam,
  ROTATION_FIXTURES,
} from '@/harness/dominoFixtures';
import { HarnessShell } from './HarnessShell';

const tileStyle: CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
};

export const DominoHarness: FC = () => {
  const [searchParams] = useSearchParams();
  const colorEnabled = searchParams.get('color') === 'true';
  const setSize = parseSetParam(searchParams.get('set'));
  const pipColors = colorEnabled ? DEFAULT_PIP_COLORS : undefined;

  const colorLink = colorEnabled
    ? `/harness/dominoes?set=${setSize}`
    : `/harness/dominoes?set=${setSize}&color=true`;

  return (
    <HarnessShell
      testId="domino-harness"
      title="Domino Tile Harness"
      description="Reference tiles for doubles, mixed values, and rotations."
      dataSet={setSize}
      controls={
        <>
          <SetPicker
            currentSet={setSize}
            basePath="/harness/dominoes"
            preserveParams={colorEnabled ? ['color'] : []}
          />
          <Link to={colorLink} style={{ color: '#2563EB', fontSize: 14 }}>
            {colorEnabled ? 'Disable pip colors' : 'Enable pip colors'}
          </Link>
        </>
      }
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Doubles 0–{setSize}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 16,
          }}
        >
          {doubleFixtures(setSize).map((fixture) => (
            <div
              key={fixture.id}
              data-testid={fixture.id}
              data-value1={fixture.value1}
              data-value2={fixture.value2}
              style={tileStyle}
            >
              <span style={{ fontWeight: 600 }}>{fixture.label}</span>
              <DominoTile
                value1={fixture.value1}
                value2={fixture.value2}
                maxPips={setSize}
                width={60}
                height={120}
                pipColor="black"
                pipColors={pipColors}
              />
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Mixed tiles</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 16,
          }}
        >
          {mixedFixtures(setSize).map((fixture) => (
            <div
              key={fixture.id}
              data-testid={fixture.id}
              data-value1={fixture.value1}
              data-value2={fixture.value2}
              style={tileStyle}
            >
              <span style={{ fontWeight: 600 }}>{fixture.label}</span>
              <DominoTile
                value1={fixture.value1}
                value2={fixture.value2}
                maxPips={setSize}
                width={60}
                height={120}
                pipColor="black"
                pipColors={pipColors}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 16 }}>Rotations (6|9)</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {ROTATION_FIXTURES.map((fixture) => (
            <div
              key={fixture.id}
              data-testid={fixture.id}
              data-rotation={fixture.rotation}
              style={tileStyle}
            >
              <span style={{ fontWeight: 600 }}>{fixture.label}</span>
              <DominoTile
                value1={fixture.value1}
                value2={fixture.value2}
                maxPips={setSize}
                width={60}
                height={120}
                rotation={fixture.rotation}
                pipColor="black"
                pipColors={pipColors}
              />
            </div>
          ))}
        </div>
      </section>
    </HarnessShell>
  );
};

export default DominoHarness;
