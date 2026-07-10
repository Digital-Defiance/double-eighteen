import { FC } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PipPattern } from './PipPattern';
import { DEFAULT_PIP_COLORS } from './pipColors';
import { SetPicker } from './harness/SetPicker';
import { parseSetParam } from '../harness/dominoFixtures';

export const PipPatternHarness: FC = () => {
  const [searchParams] = useSearchParams();
  const colorEnabled = searchParams.get('color') === 'true';
  const setSize = parseSetParam(searchParams.get('set'));
  const pipColors = colorEnabled ? DEFAULT_PIP_COLORS : undefined;

  const colorLink = colorEnabled
    ? `/harness/pips?set=${setSize}`
    : `/harness/pips?set=${setSize}&color=true`;

  return (
    <div
      data-testid="pip-harness"
      data-colors-enabled={colorEnabled}
      data-set={setSize}
      style={{ padding: 24, backgroundColor: '#f3f4f6' }}
    >
      <p style={{ marginBottom: 16 }}>
        <Link to="/harness" style={{ color: '#2563EB' }}>
          ← All harnesses
        </Link>
        {' · '}
        <Link to="/" style={{ color: '#2563EB' }}>
          Demo
        </Link>
      </p>
      <h1>Pip Pattern Harness</h1>
      <p style={{ color: '#6b7280', marginBottom: 8 }}>
        Reference grid for validating pip counts and positions (values 0–{setSize}).
      </p>
      <SetPicker
        currentSet={setSize}
        basePath="/harness/pips"
        preserveParams={colorEnabled ? ['color'] : []}
      />
      <p style={{ marginBottom: 24 }}>
        <Link to={colorLink} style={{ color: '#2563EB', fontSize: 14 }}>
          {colorEnabled ? 'Disable pip colors' : 'Enable pip colors'}
        </Link>
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 24,
        }}
      >
        {Array.from({ length: setSize + 1 }, (_, value) => (
          <div
            key={value}
            data-testid={`pip-value-${value}`}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{value}</div>
            <div
              style={{
                width: 100,
                height: 100,
                position: 'relative',
                margin: '0 auto',
                backgroundColor: '#fff',
                border: '1px solid #d1d5db',
                borderRadius: 8,
              }}
            >
              <PipPattern value={value} pipColor="black" pipColors={pipColors} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipPatternHarness;
