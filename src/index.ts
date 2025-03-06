// Components
export { DoubleTwelve } from './app/DoubleTwelve';
export type { DoubleTwelveProps } from './app/DoubleTwelve';
export { MexicanTrainGame } from './app/MexicanTrainGame';
export { DominoHub } from './app/DominoHub';
export { DominoTrain } from './app/DominoTrain';

// Pip color API
export {
  DEFAULT_PIP_COLORS,
  PIP_COLORS,
  mergePipColors,
  resolvePipStyle,
  getPipStyle,
} from './app/pipColors';
export type { PipColorMap, PipColorStyle } from './app/pipColors';
export { PIP_LAYOUTS, getPipLayout } from './app/pipLayouts';
export { resolvePipPosition } from './app/pipGrid';
export type { PipGridSize, PipLayoutCell } from './app/pipGrid';

export {
  computeTrainLayout,
  computeTrainTree,
  flattenSegments,
  stepAlongTrain,
  outwardPerpSign,
  getTrainLayoutBounds,
  tileCorners,
  tilesOverlap,
  CHICKEN_FOOT_TOE_ANGLES,
} from './app/trainLayout';
export type { TrainLayoutBounds } from './app/trainLayout';
export type {
  TrainLayoutEntry,
  TrainLayoutStyle,
  TrainSegment,
  ComputeTrainLayoutInput,
  ComputeTrainTreeInput,
} from './app/trainLayout';
export {
  validateTrainLayout,
  validateTrainTree,
  validateChickenFootChain,
} from './harness/layoutValidation';
export type { LayoutValidationResult } from './harness/layoutValidation';
export { TRAIN_FIXTURES, CHICKEN_FOOT_FIXTURES } from './harness/trainFixtures';

// Game types
export type { GameState } from './game/GameState';
export type { TrainData, TrainBranch } from './game/TrainData';
export type { DominoValue } from './game/DominoValue';

// Rules core
export {
  tileKey,
  dominoKey,
  isDouble,
  tileHasValue,
  otherEnd,
  orientForConnection,
  generateDominoSet,
  dominoSetSize,
} from './rules/dominoSet';
export {
  DEFAULT_RULES,
  resolveRules,
  requiredDoubleAnswers,
  sideToeSlots,
} from './rules/rulesConfig';
export type {
  RulesConfig,
  ChickenFootConfig,
  DoubleObligation,
} from './rules/rulesConfig';
export {
  getOpenEnds,
  getUnsatisfiedDoubles,
  getBranchAt,
  collectPlayedKeys,
  evaluatePlacement,
  getLegalMoves,
  applyMove,
  playMove,
} from './rules/placement';
export type {
  OpenEnd,
  Move,
  BranchPath,
  PlacementResult,
  PlacementViolation,
  PlayMoveResult,
} from './rules/placement';
