import { FC, useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DoubleTwelve } from '@/app/DominoSetPresets';
import { Viewport } from '@/app/Viewport';
import {
  DOMINO_HEIGHT,
  DOMINO_WIDTH,
  TrainLayoutEntry,
  TrainLayoutStyle,
  computeTrainTree,
  flattenSegments,
  getTrainLayoutBounds,
} from '@/app/trainLayout';
import {
  TurnSide,
  buildBranchTiles,
  cycleBendAt,
  linearDefaultSide,
  offsetDefaultSide,
} from '@/app/trainBends';
import { TrainBend, TrainBranch } from '@/game/TrainData';
import { HarnessShell } from './HarnessShell';

const chain = (...vals: number[]) =>
  vals.slice(0, -1).map((v, i) => ({ value1: v, value2: vals[i + 1] }));

// A long bendable train (with a chicken-foot double) plus a static neighbour to
// exercise collision-blocking. The 8-8 double at index 2 fans two toes; bending
// the path past it shows the toes follow the double's turned heading.
const MAIN_START = { x: 360, y: 360 };
const MAIN_ANGLE = 0;
const MAIN_DOMINOES = [
  { value1: 12, value2: 9 },
  { value1: 9, value2: 8 },
  { value1: 8, value2: 8 },
  { value1: 8, value2: 6 },
  { value1: 6, value2: 5 },
  { value1: 5, value2: 3 },
  { value1: 3, value2: 2 },
  { value1: 2, value2: 10 },
  { value1: 10, value2: 7 },
  { value1: 7, value2: 4 },
  { value1: 4, value2: 1 },
  { value1: 1, value2: 11 },
  { value1: 11, value2: 0 },
];
const MAIN_FEET = {
  2: [{ dominoes: [{ value1: 8, value2: 3 }] }, { dominoes: [{ value1: 8, value2: 0 }] }],
};

const NEIGHBOUR_BRANCH: TrainBranch = {
  dominoes: chain(12, 11, 10, 9, 8, 7, 6),
};
const NEIGHBOUR_START = { x: 360, y: 120 };
const NEIGHBOUR_ANGLE = 0;

const CONTENT_PADDING = 80;
const VIEWPORT_W = 900;
const VIEWPORT_H = 560;

export const BendHarness: FC = () => {
  const [searchParams] = useSearchParams();
  const layoutStyle = (searchParams.get('layout') === 'linear'
    ? 'linear'
    : 'offset') as TrainLayoutStyle;

  const [bends, setBends] = useState<TrainBend[]>([]);
  const [blockedIndex, setBlockedIndex] = useState<number | null>(null);

  const mainBranch = useMemo<TrainBranch>(
    () => ({ dominoes: MAIN_DOMINOES, bends, feet: MAIN_FEET }),
    [bends]
  );

  // The neighbour is a fixed obstacle; bends on the main train may not cross it.
  const neighbourTiles = useMemo(
    () =>
      buildBranchTiles(NEIGHBOUR_BRANCH, {
        startX: NEIGHBOUR_START.x,
        startY: NEIGHBOUR_START.y,
        angle: NEIGHBOUR_ANGLE,
        layoutStyle,
      }),
    [layoutStyle]
  );

  const mainSegments = useMemo(
    () =>
      computeTrainTree({
        startX: MAIN_START.x,
        startY: MAIN_START.y,
        angle: MAIN_ANGLE,
        branch: mainBranch,
        layoutStyle,
      }),
    [mainBranch, layoutStyle]
  );

  const mainTiles = flattenSegments(mainSegments);
  const allTiles = [...mainTiles, ...neighbourTiles];
  const bounds = getTrainLayoutBounds(allTiles, CONTENT_PADDING);

  const handleBendAt = useCallback(
    (runIndex: number) => {
      const build = {
        startX: MAIN_START.x,
        startY: MAIN_START.y,
        angle: MAIN_ANGLE,
        layoutStyle,
      };

      // Default side: offset folds to the empty side; linear toward more room.
      let preferred: TurnSide;
      if (layoutStyle === 'offset') {
        preferred = offsetDefaultSide(MAIN_ANGLE, mainSegments[0]?.outwardSign);
      } else {
        const tile = mainTiles[runIndex];
        preferred = linearDefaultSide(
          { x: tile.x + bounds.offsetX, y: tile.y + bounds.offsetY },
          MAIN_ANGLE,
          { width: bounds.width, height: bounds.height }
        );
      }

      const result = cycleBendAt(
        { dominoes: MAIN_DOMINOES, bends, feet: MAIN_FEET },
        runIndex,
        build,
        neighbourTiles,
        preferred
      );

      if (result.blocked) {
        setBlockedIndex(runIndex);
        return;
      }
      setBlockedIndex(null);
      setBends(result.bends);
    },
    [bends, layoutStyle, mainSegments, mainTiles, neighbourTiles, bounds]
  );

  const bentIndexes = new Set(bends.map((b) => b.index));

  return (
    <HarnessShell
      testId="bend-harness"
      title="Bend / Pivot Harness"
      description="Click a tile on the train to fold its path at that point (cycles default side → opposite → straight). Bends that would cross the neighbouring train are refused. Drag to pan, wheel or buttons to zoom."
      controls={
        <div style={{ display: 'flex', gap: 16, fontSize: 14, alignItems: 'center' }}>
          <Link
            to="/harness/bends?layout=offset"
            data-testid="bend-layout-offset"
            style={{
              color: layoutStyle === 'offset' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'offset' ? 700 : 400,
            }}
          >
            Offset layout
          </Link>
          <Link
            to="/harness/bends?layout=linear"
            data-testid="bend-layout-linear"
            style={{
              color: layoutStyle === 'linear' ? '#111827' : '#2563EB',
              fontWeight: layoutStyle === 'linear' ? 700 : 400,
            }}
          >
            Linear layout
          </Link>
          <button
            type="button"
            data-testid="bend-reset"
            onClick={() => {
              setBends([]);
              setBlockedIndex(null);
            }}
            style={{ cursor: 'pointer', padding: '4px 10px' }}
          >
            Clear bends
          </button>
          <span data-testid="bend-count" style={{ color: '#6b7280' }}>
            {bends.length} bend{bends.length === 1 ? '' : 's'}
          </span>
          {blockedIndex != null && (
            <span data-testid="bend-blocked" style={{ color: '#b91c1c', fontWeight: 600 }}>
              Bend at tile {blockedIndex} blocked — it would cross another train.
            </span>
          )}
        </div>
      }
    >
      <div
        data-testid="bend-harness-layout"
        data-layout-style={layoutStyle}
        data-bend-count={bends.length}
      >
        <Viewport
          width={VIEWPORT_W}
          height={VIEWPORT_H}
          contentWidth={bounds.width}
          contentHeight={bounds.height}
          testId="bend-viewport"
        >
          {neighbourTiles.map((entry, index) => (
            <TileView
              key={`neighbour-${index}`}
              entry={entry}
              offsetX={bounds.offsetX}
              offsetY={bounds.offsetY}
              borderColor="#9ca3af"
            />
          ))}
          {mainSegments.map((segment, segIndex) =>
            segment.layout.map((entry, tileIndex) => {
              // Only main-run (depth 0) tiles are bendable for now.
              const runIndex = segment.depth === 0 ? tileIndex : undefined;
              return (
                <TileView
                  key={`main-${segIndex}-${tileIndex}`}
                  entry={entry}
                  offsetX={bounds.offsetX}
                  offsetY={bounds.offsetY}
                  borderColor={
                    runIndex != null && bentIndexes.has(runIndex) ? '#b45309' : 'black'
                  }
                  highlight={runIndex != null && bentIndexes.has(runIndex)}
                  onClick={runIndex != null ? () => handleBendAt(runIndex) : undefined}
                  testId={
                    runIndex != null ? `bend-tile-${runIndex}` : undefined
                  }
                />
              );
            })
          )}
        </Viewport>
      </div>
    </HarnessShell>
  );
};

interface TileViewProps {
  entry: TrainLayoutEntry;
  offsetX: number;
  offsetY: number;
  borderColor: string;
  highlight?: boolean;
  onClick?: () => void;
  testId?: string;
}

const TileView: FC<TileViewProps> = ({
  entry,
  offsetX,
  offsetY,
  borderColor,
  highlight,
  onClick,
  testId,
}) => (
  <div
    data-testid={testId}
    onClick={onClick}
    style={{
      position: 'absolute',
      left: `${entry.x - DOMINO_WIDTH / 2 + offsetX}px`,
      top: `${entry.y - DOMINO_HEIGHT / 2 + offsetY}px`,
      cursor: onClick ? 'pointer' : 'default',
      outline: highlight ? '2px dashed #fde047' : undefined,
    }}
  >
    <DoubleTwelve
      value1={entry.value1}
      value2={entry.value2}
      width={DOMINO_WIDTH}
      height={DOMINO_HEIGHT}
      rotation={entry.rotation}
      pipColor="black"
      borderColor={borderColor}
    />
  </div>
);

export default BendHarness;
