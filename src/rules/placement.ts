import { DominoValue } from '@/game/DominoValue';
import { TrainBranch } from '@/game/TrainData';
import {
  dominoKey,
  isDouble,
  orientForConnection,
} from '@/rules/dominoSet';
import {
  RulesConfig,
  requiredDoubleAnswers,
  sideToeSlots,
} from '@/rules/rulesConfig';

/**
 * Locates a branch inside a chicken-foot tree. Empty path = the main line; each
 * step descends into the `toeIndex`-th side toe hanging off the double at
 * `doubleIndex` of the current branch.
 */
export type BranchPath = ReadonlyArray<{
  doubleIndex: number;
  toeIndex: number;
}>;

export interface OpenEnd {
  path: BranchPath;
  attach: 'run-tail' | 'side-toe';
  /** Pip value a tile must match to attach here. */
  value: number;
  /** For side-toe ends: which double in the branch, and which toe slot. */
  doubleIndex?: number;
  toeSlot?: number;
  /** The tile being attached to is a double (for the no-consecutive rule). */
  attachToDouble: boolean;
  /** This end exists only because an unanswered double must be satisfied. */
  obligation: boolean;
}

export interface Move {
  end: OpenEnd;
  tile: DominoValue;
}

export type PlacementViolation =
  | 'value-mismatch'
  | 'duplicate-tile'
  | 'consecutive-doubles';

export interface PlacementResult {
  legal: boolean;
  violations: PlacementViolation[];
}

export function getBranchAt(
  root: TrainBranch,
  path: BranchPath
): TrainBranch | undefined {
  let current: TrainBranch | undefined = root;
  for (const step of path) {
    current = current?.feet?.[step.doubleIndex]?.[step.toeIndex];
    if (!current) return undefined;
  }
  return current;
}

interface DoubleStatus {
  path: BranchPath;
  doubleIndex: number;
  value: number;
  hasCenter: boolean;
  sideToes: number;
  answers: number;
}

function walkBranches(
  branch: TrainBranch,
  path: BranchPath,
  visit: (branch: TrainBranch, path: BranchPath) => void
): void {
  visit(branch, path);
  if (!branch.feet) return;
  for (const key of Object.keys(branch.feet)) {
    const doubleIndex = Number(key);
    branch.feet[doubleIndex].forEach((toe, toeIndex) => {
      walkBranches(toe, [...path, { doubleIndex, toeIndex }], visit);
    });
  }
}

function collectDoubles(root: TrainBranch): DoubleStatus[] {
  const out: DoubleStatus[] = [];
  walkBranches(root, [], (branch, path) => {
    branch.dominoes.forEach((domino, doubleIndex) => {
      if (domino.value1 !== domino.value2) return;
      const hasCenter = doubleIndex < branch.dominoes.length - 1;
      const sideToes = branch.feet?.[doubleIndex]?.length ?? 0;
      out.push({
        path,
        doubleIndex,
        value: domino.value1,
        hasCenter,
        sideToes,
        answers: (hasCenter ? 1 : 0) + sideToes,
      });
    });
  });
  return out;
}

/** Doubles that still owe answers under the current rules. */
export function getUnsatisfiedDoubles(
  root: TrainBranch,
  config: RulesConfig
): DoubleStatus[] {
  const required = requiredDoubleAnswers(config);
  if (required <= 0) return [];
  return collectDoubles(root).filter((d) => d.answers < required);
}

/** Every key of every tile already placed in the tree (for uniqueness checks). */
export function collectPlayedKeys(root: TrainBranch): Set<string> {
  const keys = new Set<string>();
  walkBranches(root, [], (branch) => {
    for (const domino of branch.dominoes) {
      keys.add(dominoKey(domino));
    }
  });
  return keys;
}

/**
 * All places a tile may legally attach to this train, honoring double
 * obligations. When a double is unanswered (and the rules require answers),
 * only that double's open slots are offered until it is satisfied.
 */
export function getOpenEnds(
  root: TrainBranch,
  startValue: number,
  config: RulesConfig
): OpenEnd[] {
  if (root.dominoes.length === 0) {
    return [
      {
        path: [],
        attach: 'run-tail',
        value: startValue,
        attachToDouble: true, // a train starts off the engine double
        obligation: false,
      },
    ];
  }

  const unsatisfied = getUnsatisfiedDoubles(root, config);

  if (config.doubleObligation !== 'none' && unsatisfied.length > 0) {
    const slots = sideToeSlots(config);
    const ends: OpenEnd[] = [];

    for (const status of unsatisfied) {
      const branch = getBranchAt(root, status.path);
      if (!branch) continue;

      // Center continuation: only available if the double is the run's tail.
      if (!status.hasCenter && status.doubleIndex === branch.dominoes.length - 1) {
        ends.push({
          path: status.path,
          attach: 'run-tail',
          value: status.value,
          attachToDouble: true,
          obligation: true,
        });
      }

      if (status.sideToes < slots) {
        ends.push({
          path: status.path,
          attach: 'side-toe',
          value: status.value,
          doubleIndex: status.doubleIndex,
          toeSlot: status.sideToes,
          attachToDouble: true,
          obligation: true,
        });
      }
    }

    return ends;
  }

  // No active obligation: the growing tip of every branch is open.
  const ends: OpenEnd[] = [];
  walkBranches(root, [], (branch, path) => {
    const last = branch.dominoes[branch.dominoes.length - 1];
    if (!last) return;
    ends.push({
      path,
      attach: 'run-tail',
      value: last.value2,
      attachToDouble: isDouble(last),
      obligation: false,
    });
  });
  return ends;
}

export function evaluatePlacement(
  tile: DominoValue,
  end: OpenEnd,
  playedKeys: ReadonlySet<string>,
  config: RulesConfig
): PlacementResult {
  const violations: PlacementViolation[] = [];

  const oriented = orientForConnection(tile, end.value);
  if (config.requireSequential && !oriented) {
    violations.push('value-mismatch');
  }

  if (config.requireUniqueTiles && playedKeys.has(dominoKey(tile))) {
    violations.push('duplicate-tile');
  }

  if (!config.allowConsecutiveDoubles && end.attachToDouble && isDouble(tile)) {
    violations.push('consecutive-doubles');
  }

  return { legal: violations.length === 0, violations };
}

/** Every legal (open end × hand tile) move for this train. */
export function getLegalMoves(
  root: TrainBranch,
  startValue: number,
  hand: readonly DominoValue[],
  playedKeys: ReadonlySet<string>,
  config: RulesConfig
): Move[] {
  const ends = getOpenEnds(root, startValue, config);
  const moves: Move[] = [];
  for (const end of ends) {
    for (const tile of hand) {
      if (evaluatePlacement(tile, end, playedKeys, config).legal) {
        moves.push({ end, tile });
      }
    }
  }
  return moves;
}

function updateBranchAt(
  branch: TrainBranch,
  path: BranchPath,
  updater: (branch: TrainBranch) => TrainBranch
): TrainBranch {
  if (path.length === 0) {
    return updater(branch);
  }
  const [step, ...rest] = path;
  const toes = branch.feet?.[step.doubleIndex] ?? [];
  const updatedToes = toes.map((toe, index) =>
    index === step.toeIndex ? updateBranchAt(toe, rest, updater) : toe
  );
  return {
    ...branch,
    feet: { ...branch.feet, [step.doubleIndex]: updatedToes },
  };
}

/**
 * Returns a new tree with `move` applied. The tile is oriented so its matching
 * end connects. Does not validate; call {@link evaluatePlacement} first (or use
 * {@link playMove}).
 */
export function applyMove(
  root: TrainBranch,
  move: Move,
  _config?: RulesConfig
): TrainBranch {
  const oriented =
    orientForConnection(move.tile, move.end.value) ?? { ...move.tile };

  return updateBranchAt(root, move.end.path, (branch) => {
    if (move.end.attach === 'run-tail') {
      return { ...branch, dominoes: [...branch.dominoes, oriented] };
    }

    const doubleIndex = move.end.doubleIndex ?? 0;
    const slot = move.end.toeSlot ?? branch.feet?.[doubleIndex]?.length ?? 0;
    const existing = branch.feet?.[doubleIndex]
      ? [...branch.feet[doubleIndex]]
      : [];
    existing[slot] = { dominoes: [oriented] };
    return {
      ...branch,
      feet: { ...branch.feet, [doubleIndex]: existing },
    };
  });
}

export interface PlayMoveResult {
  ok: boolean;
  board: TrainBranch;
  violations: PlacementViolation[];
}

/** Validates a move against the rules and applies it only if legal. */
export function playMove(
  root: TrainBranch,
  move: Move,
  config: RulesConfig
): PlayMoveResult {
  const result = evaluatePlacement(
    move.tile,
    move.end,
    collectPlayedKeys(root),
    config
  );
  if (!result.legal) {
    return { ok: false, board: root, violations: result.violations };
  }
  return { ok: true, board: applyMove(root, move, config), violations: [] };
}
