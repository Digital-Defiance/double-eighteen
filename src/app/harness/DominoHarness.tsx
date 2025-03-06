import { FC, CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DoubleTwelve } from '@/app/DoubleTwelve';
import { DEFAULT_PIP_COLORS } from '@/app/pipColors';
import {
  DOUBLE_FIXTURES,
  MIXED_FIXTURES,
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
  const pipColors = colorEnabled ? DEFAULT_PIP_COLORS : undefined;

  return (
    <HarnessShell
      testId="domino-harness"
      title="Domino Tile Harness"
      description="Reference tiles for doubles, mixed values, and rotations."
      controls={
        colorEnabled ? (
          <Link to="/harness/dominoes" style={{ color: '#2563EB', fontSize: 14 }}>
            Disable pip colors
          </Link>
        ) : (
          <Link
            to="/harness/dominoes?color=true"
            style={{ color: '#2563EB', fontSize: 14 }}
          >
            Enable pip colors
          </Link>
        )
      }
    >
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Doubles 0–12</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 16,
          }}
        >
          {DOUBLE_FIXTURES.map((fixture) => (
            <div
              key={fixture.id}
              data-testid={fixture.id}
              data-value1={fixture.value1}
              data-value2={fixture.value2}
              style={tileStyle}
            >
              <span style={{ fontWeight: 600 }}>{fixture.label}</span>
              <DoubleTwelve
                value1={fixture.value1}
                value2={fixture.value2}
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
          {MIXED_FIXTURES.map((fixture) => (
            <div
              key={fixture.id}
              data-testid={fixture.id}
              data-value1={fixture.value1}
              data-value2={fixture.value2}
              style={tileStyle}
            >
              <span style={{ fontWeight: 600 }}>{fixture.label}</span>
              <DoubleTwelve
                value1={fixture.value1}
                value2={fixture.value2}
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
              <DoubleTwelve
                value1={fixture.value1}
                value2={fixture.value2}
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
