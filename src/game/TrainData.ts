import { DominoValue } from './DominoValue';

/**
 * A pivot in a run's path. At `index` (a tile position within `dominoes`) the run
 * stops going straight and turns by `turn` degrees, so a player can fold a train
 * into Ls, Us, and meandering snakes to avoid other trains. Bends are layout
 * hints only — they never change which tiles connect (the value chain is
 * untouched), so like-values keep touching across every corner.
 *
 * `turn` is signed degrees relative to the current heading, in the same
 * convention as a branch's `angle` (0° = +x, 90° = +y / downward on screen).
 * The interactive default is ±90°; the sign is chosen by a heuristic when the
 * player first bends, then persisted here so the path is stable across renders.
 */
export interface TrainBend {
  /** Index in `dominoes` of the first tile that continues in the new heading. */
  index: number;
  /** Signed turn in degrees applied to the heading at this point. */
  turn: number;
}

/**
 * A run of dominoes that can sprout chicken-foot side toes at its doubles.
 *
 * The structure is recursive: each side toe is itself a TrainBranch, so a toe
 * can contain its own doubles and feet (nested feet).
 */
export interface TrainBranch {
  dominoes: DominoValue[];
  /**
   * Chicken-foot side toes, keyed by the index (within `dominoes`) of the double
   * they hang off. A double fans three toes from its open end (-45°, 0°, +45°);
   * the center (0°) toe is the straight main-line continuation and stays inline
   * in `dominoes`, so only the two angled side toes are stored here (at most two
   * entries: index 0 → -45°, index 1 → +45°).
   */
  feet?: Record<number, TrainBranch[]>;
  /**
   * Optional pivots that fold this run's path. Order-independent (the engine
   * sorts by index); at most one bend per index. Absent/empty = a straight run.
   */
  bends?: TrainBend[];
}

export interface TrainData extends TrainBranch {
  playerId: number;
  isPublic: boolean;
}
