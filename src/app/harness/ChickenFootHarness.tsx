import { FC } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DoubleTwelve } from '@/app/DominoSetPresets';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  TrainLayoutStyle,
  computeTrainTree,
  flattenSegments,
  getTrainLayoutBounds,
} from '@/app/trainLayout';
import {
  validateChickenFootChain,
  validateTrainTree,
} from '@/harness/layoutValidation';
import { TrainBranch } from '@/game/TrainData';
import { CHICKEN_FOOT_FIXTURES } from '@/harness/trainFixtures';
import { HarnessShell } from './HarnessShell';
import { useDebugDrag } from './useDebugDrag';

const START_X = 220;
const START_Y = 220;

export const ChickenFootHarness: FC = () => {
  const [searchParams] = useSearchParams();
  const layoutStyle = (searchParams.get('layout') === 'linear'
    ? 'linear'
    : 'offset') as TrainLayoutStyle;
  const dragDebug = searchParams.get('debug') === 'drag';

  const fixtures = CHICKEN_FOOT_FIXTURES.filter((fixture) =>
    fixture.layoutStyles.includes(layoutStyle)
  );

  // Build a harness URL that preserves the other toggle.
  const href = (overrides: { layout?: TrainLayoutStyle; drag?: boolean }) => {
    const params = new URLSearchParams();
    params.set('layout', overrides.layout ?? layoutStyle);
    if (overrides.drag ?? dragDebug) {
      params.set('debug', 'drag');
    }
    return `/harness/chicken-foot?${params.toString()}`;
  };

  return (
    <HarnessShell
      testId="chicken-foot-harness"
      title="Chicken Foot Harness"
      description="Doubles fan three toes (±45° + a straight center). Recursive: a toe's own double sprouts its own foot."
      controls={
        <div style={{ display: 'flex', gap: 16, fontSize: 14, alignItems: 'center' }}>
          <Link
            to={href({ layout: 'offset' })}
            data-testid="chicken-foot-layout-offset"
            style={{
              color: layoutStyle === 'offset' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'offset' ? 700 : 400,
            }}
          >
            Offset layout
          </Link>
          <Link
            to={href({ layout: 'linear' })}
            data-testid="chicken-foot-layout-linear"
            style={{
              color: layoutStyle === 'linear' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'linear' ? 700 : 400,
            }}
          >
            Linear layout
          </Link>
          <Link
            to={href({ drag: !dragDebug })}
            data-testid="chicken-foot-drag-toggle"
            style={{
              marginLeft: 'auto',
              color: dragDebug ? '#b91c1c' : '#2563EB',
              fontWeight: dragDebug ? 700 : 400,
            }}
          >
            {dragDebug ? 'Drag debug: on' : 'Drag debug: off'}
          </Link>
        </div>
      }
    >
      <div
        data-testid="chicken-foot-harness-layout"
        data-layout-style={layoutStyle}
        data-drag-debug={dragDebug}
        style={{ display: 'grid', gap: 24 }}
      >
        {fixtures.map((fixture) => (
          <ChickenFootCanvas
            key={`${fixture.id}-${layoutStyle}`}
            fixtureId={fixture.id}
            name={fixture.name}
            description={fixture.description}
            angle={fixture.angle}
            branch={fixture.branch}
            layoutStyle={layoutStyle}
            dragDebug={dragDebug}
          />
        ))}
      </div>
    </HarnessShell>
  );
};

interface ChickenFootCanvasProps {
  fixtureId: string;
  name: string;
  description: string;
  angle: number;
  branch: TrainBranch;
  layoutStyle: TrainLayoutStyle;
  dragDebug: boolean;
}

// Tint side toes by depth so the foot structure reads at a glance.
const DEPTH_BORDERS = ['black', '#b45309', '#7c3aed', '#0e7490'];

const ChickenFootCanvas: FC<ChickenFootCanvasProps> = ({
  fixtureId,
  name,
  description,
  angle,
  branch,
  layoutStyle,
  dragDebug,
}) => {
  const segments = computeTrainTree({
    startX: START_X,
    startY: START_Y,
    angle,
    branch,
    layoutStyle,
  });

  const flat = flattenSegments(segments);
  const bounds = getTrainLayoutBounds(flat);
  const chain = validateChickenFootChain(branch);
  const geometry = validateTrainTree(segments);
  const issues = [...chain.issues, ...geometry.issues];
  const valid = issues.length === 0;

  // Opt-in drag debugging: nudge toes into place and screenshot. The readout
  // reports each moved tile's center relative to its host double, in
  // domino-width/height units, so the target is unambiguous.
  const drag = useDebugDrag(dragDebug);

  // The main (depth 0) double is the reference origin for the readout.
  const hubTile = segments[0]?.layout.find((entry) => entry.isDouble);

  const movedReadout = drag.movedKeys
    .map((key) => {
      const value = drag.getOffset(key);
      const [segmentIndex, tileIndex] = key.split('-').map(Number);
      const entry = segments[segmentIndex]?.layout[tileIndex];
      if (!entry || !hubTile) return null;
      const cx = entry.x + value.dx - hubTile.x;
      const cy = entry.y + value.dy - hubTile.y;
      return {
        key,
        label: `${entry.value1}-${entry.value2}`,
        wx: (cx / DOMINO_WIDTH).toFixed(2),
        hy: (cy / DOMINO_HEIGHT).toFixed(2),
        px: `${Math.round(cx)},${Math.round(cy)}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <section
      data-testid={`chicken-foot-fixture-${fixtureId}`}
      data-layout-style={layoutStyle}
      data-angle={angle}
      data-valid={valid}
      data-segments={segments.length}
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
          data-testid={`chicken-foot-status-${fixtureId}`}
          style={{
            margin: '8px 0 0',
            fontSize: 13,
            color: valid ? '#166534' : '#b91c1c',
          }}
        >
          {valid
            ? `Layout validation passed (${segments.length} segments)`
            : `Layout validation failed: ${issues[0]?.message}`}
        </p>
      </div>

      <div
        data-testid={`chicken-foot-canvas-${fixtureId}`}
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
        {segments.map((segment, segmentIndex) =>
          segment.layout.map((entry, tileIndex) => {
            const key = `${segmentIndex}-${tileIndex}`;
            const offset = drag.getOffset(key);
            const moved = offset.dx !== 0 || offset.dy !== 0;
            return (
              <div
                key={key}
                data-testid={`chicken-foot-domino-${fixtureId}-${segmentIndex}-${tileIndex}`}
                data-depth={segment.depth}
                data-angle={segment.angle}
                data-x={entry.x}
                data-y={entry.y}
                data-rotation={entry.rotation}
                data-is-double={entry.isDouble}
                onPointerDown={
                  dragDebug
                    ? (event) => drag.onPointerDown(key, event)
                    : undefined
                }
                style={{
                  position: 'absolute',
                  left: `${entry.x - DOMINO_WIDTH / 2 + bounds.offsetX + offset.dx}px`,
                  top: `${entry.y - DOMINO_HEIGHT / 2 + bounds.offsetY + offset.dy}px`,
                  cursor: dragDebug ? 'grab' : undefined,
                  touchAction: dragDebug ? 'none' : undefined,
                  outline: moved ? '2px dashed #fde047' : undefined,
                }}
              >
                <DoubleTwelve
                  value1={entry.value1}
                  value2={entry.value2}
                  width={DOMINO_WIDTH}
                  height={DOMINO_HEIGHT}
                  rotation={entry.rotation}
                  pipColor="black"
                  borderColor={
                    DEPTH_BORDERS[segment.depth] ??
                    DEPTH_BORDERS[DEPTH_BORDERS.length - 1]
                  }
                />
              </div>
            );
          })
        )}
      </div>

      {movedReadout.length > 0 && (
        <div
          data-testid={`chicken-foot-readout-${fixtureId}`}
          style={{
            marginTop: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#374151',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: '8px 10px',
          }}
        >
          <div style={{ marginBottom: 4, fontWeight: 700 }}>
            Moved tiles (center relative to the main double):
          </div>
          {movedReadout.map((row) => (
            <div key={row.key}>
              {row.label}: ({row.wx}w, {row.hy}h) · {row.px}px
            </div>
          ))}
          <button
            type="button"
            onClick={drag.reset}
            style={{ marginTop: 6, fontSize: 12, cursor: 'pointer' }}
          >
            Reset positions
          </button>
        </div>
      )}
    </section>
  );
};

export default ChickenFootHarness;
