import { FC, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DoubleTwelve } from '@/app/DominoSetPresets';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  TrainLayoutStyle,
  computeTrainLayout,
  getTrainLayoutBounds,
} from '@/app/trainLayout';
import { validateTrainLayout } from '@/harness/layoutValidation';
import { TRAIN_FIXTURES } from '@/harness/trainFixtures';
import { HarnessShell } from './HarnessShell';

const TRAIN_START_X = 100;
const TRAIN_START_Y = 100;

export const TrainHarness: FC = () => {
  const [searchParams] = useSearchParams();
  const layoutStyle = (searchParams.get('layout') === 'linear'
    ? 'linear'
    : 'offset') as TrainLayoutStyle;

  const fixtures = useMemo(
    () =>
      TRAIN_FIXTURES.filter((fixture) =>
        fixture.layoutStyles.includes(layoutStyle)
      ),
    [layoutStyle]
  );

  return (
    <HarnessShell
      testId="train-harness"
      title="Train Layout Harness"
      description="Deterministic train fixtures with layout metadata for automated spacing checks."
      controls={
        <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <Link
            to="/harness/trains?layout=offset"
            data-testid="train-layout-offset"
            style={{
              color: layoutStyle === 'offset' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'offset' ? 700 : 400,
            }}
          >
            Offset layout
          </Link>
          <Link
            to="/harness/trains?layout=linear"
            data-testid="train-layout-linear"
            style={{
              color: layoutStyle === 'linear' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'linear' ? 700 : 400,
            }}
          >
            Linear layout
          </Link>
        </div>
      }
    >
      <div
        data-testid="train-harness-layout"
        data-layout-style={layoutStyle}
        style={{ display: 'grid', gap: 24 }}
      >
        {fixtures.map((fixture) => (
          <TrainFixtureCanvas
            key={`${fixture.id}-${layoutStyle}`}
            fixtureId={fixture.id}
            name={fixture.name}
            description={fixture.description}
            angle={fixture.angle}
            dominoes={fixture.dominoes}
            layoutStyle={layoutStyle}
          />
        ))}
      </div>
    </HarnessShell>
  );
};

interface TrainFixtureCanvasProps {
  fixtureId: string;
  name: string;
  description: string;
  angle: number;
  dominoes: { value1: number; value2: number }[];
  layoutStyle: TrainLayoutStyle;
}

const TrainFixtureCanvas: FC<TrainFixtureCanvasProps> = ({
  fixtureId,
  name,
  description,
  angle,
  dominoes,
  layoutStyle,
}) => {
  const layout = computeTrainLayout({
    startX: TRAIN_START_X,
    startY: TRAIN_START_Y,
    angle,
    dominoes,
    layoutStyle,
  });

  const bounds = getTrainLayoutBounds(layout);
  const validation = validateTrainLayout(layout, dominoes, angle, layoutStyle);

  return (
    <section
      data-testid={`train-fixture-${fixtureId}`}
      data-layout-style={layoutStyle}
      data-angle={angle}
      data-valid={validation.valid}
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>{name}</h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>{description}</p>
        <p
          data-testid={`train-fixture-status-${fixtureId}`}
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: validation.valid ? '#166534' : '#b91c1c',
          }}
        >
          {validation.valid
            ? 'Layout validation passed'
            : `Layout validation failed: ${validation.issues[0]?.message}`}
        </p>
      </div>

      <div
        data-testid={`train-canvas-${fixtureId}`}
        style={{
          position: 'relative',
          width: bounds.width,
          height: bounds.height,
          maxWidth: '100%',
          backgroundColor: '#1f8a55',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {layout.map((entry, index) => (
          <div
            key={index}
            data-testid={`train-domino-${fixtureId}-${index}`}
            data-index={index}
            data-x={entry.x}
            data-y={entry.y}
            data-rotation={entry.rotation}
            data-is-double={entry.isDouble}
            data-value1={entry.value1}
            data-value2={entry.value2}
            style={{
              position: 'absolute',
              left: `${entry.x - DOMINO_WIDTH / 2 + bounds.offsetX}px`,
              top: `${entry.y - DOMINO_HEIGHT / 2 + bounds.offsetY}px`,
            }}
          >
            <DoubleTwelve
              value1={entry.value1}
              value2={entry.value2}
              width={DOMINO_WIDTH}
              height={DOMINO_HEIGHT}
              rotation={entry.rotation}
              pipColor="black"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrainHarness;
