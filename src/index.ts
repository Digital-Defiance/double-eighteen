// Components
export { DoubleTwelve } from './app/DoubleTwelve';
export type { DoubleTwelveProps } from './app/DoubleTwelve';
export { MexicanTrainGame } from './app/MexicanTrainGame';
export { DominoHub, hubTrainStartDistance } from './app/DominoHub';
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
  layoutsCollide,
  layoutSelfIntersects,
  normalizeBends,
  headingAtIndex,
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

// Branch bending / pivoting
export {
  TURN_DEGREES,
  sideToTurn,
  oppositeSide,
  offsetDefaultSide,
  linearDefaultSide,
  buildBranchTiles,
  withBendAt,
  resolveBend,
  cycleBendAt,
} from './app/trainBends';
export type {
  TurnSide,
  TableBounds,
  BuildTrainTilesInput,
  ResolveBendInput,
  ResolveBendResult,
} from './app/trainBends';

// Pan/zoom viewport
export { Viewport } from './app/Viewport';
export type { ViewportProps } from './app/Viewport';
export {
  clampScale,
  zoomAt,
  fitToBounds,
  screenToContent,
} from './app/viewportMath';
export type {
  ViewportTransform,
  Size as ViewportSize,
  Point as ViewportPoint,
} from './app/viewportMath';
export {
  validateTrainLayout,
  validateTrainTree,
  validateChickenFootChain,
} from './harness/layoutValidation';
export type { LayoutValidationResult } from './harness/layoutValidation';
export { TRAIN_FIXTURES, CHICKEN_FOOT_FIXTURES } from './harness/trainFixtures';

// Game types
export type { GameState } from './game/GameState';
export type { TrainData, TrainBranch, TrainBend } from './game/TrainData';
export type { DominoValue } from './game/DominoValue';
export {
  generateSampleTrains,
  type GenerateSampleTrainsOptions,
} from './game/generateSampleTrains';

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
