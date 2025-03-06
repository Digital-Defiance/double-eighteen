import { DominoValue } from './DominoValue';

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
}

export interface TrainData extends TrainBranch {
  playerId: number;
  isPublic: boolean;
}
