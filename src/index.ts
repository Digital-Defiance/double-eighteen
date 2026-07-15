// double-eighteen — headless core.
// Rules, AI, layout/geometry math, theming data, and types. NO React.
// React components live in the companion package `double-eighteen-react`.

// Theme data + types (React types are imported type-only, so this stays headless)
export {
  DEFAULT_DOMINO_THEME,
  mergeDominoTheme,
  themeDataAttributes,
} from './app/dominoTheme';
export type {
  DominoTheme,
  PipRenderContext,
  TileRenderContext,
} from './app/dominoTheme';

// Variants
export {
  DOMINO_SETS,
  clampPipValue,
  normalizeSetSize,
  resolveRulesForSet,
  isDominoSetSize,
} from './variants';
export type { DominoSetSize } from './variants';

// Pip color API
export {
  DEFAULT_PIP_COLORS,
  PIP_COLORS,
  mergePipColors,
  resolvePipStyle,
  getPipStyle,
} from './app/pipColors';
export type { PipColorMap, PipColorStyle } from './app/pipColors';
export {
  PIP_LAYOUTS,
  getPipLayout,
  buildHighValueLayout,
  HIGH_VALUE_LAYOUTS,
} from './app/pipLayouts';
export { resolvePipPosition } from './app/pipGrid';
export type { PipGridSize, PipLayoutCell } from './app/pipGrid';

// Train layout geometry
export {
  DOMINO_WIDTH,
  DOMINO_HEIGHT,
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

// Hub layout geometry (pure — the React `DominoHub` lives in double-eighteen-react)
export { hubTrainStartDistance } from './app/hubLayout';

// Pan/zoom viewport math
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

// Layout validation + fixtures
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

// AI players (offline, heuristic, extensible)
export type {
  Rng,
  AiActionBase,
  AiPlayAction,
  AiDrawAction,
  AiPassAction,
  AiAction,
  AiObservation,
  EvalContext,
  Heuristic,
  SkillProfile,
  SkillLevel,
  CandidateGenerator,
  CandidateGeneratorOptions,
  AiPlayer,
  CreateAiPlayerOptions,
  GenericHeuristic,
  PolicyPlayer,
  PolicyPlayerConfig,
  PlayerRef,
  SearchModel,
  SearchOptions,
  ScoredAction,
} from './ai';
export {
  isPlayAction,
  getAccessibleTrainIndices,
  collectAllPlayedKeys,
  generatePlayActions,
  createCandidateGenerator,
  defaultCandidateGenerator,
  HEURISTIC_IDS,
  DEFAULT_HEURISTICS,
  SKILL_PRESETS,
  getSkillProfile,
  createAiPlayer,
  scoreWithHeuristics,
  argmaxIndex,
  softmaxIndex,
  chooseActionIndex,
  createPolicyPlayer,
  searchActionValues,
} from './ai';

// Harness fixtures + parser (used by dev/visual harnesses in double-eighteen-react)
export {
  parseSetParam,
  doubleFixtures,
  DOUBLE_FIXTURES,
  mixedFixtures,
  MIXED_FIXTURES,
  halfOrientationFixtures,
  ROTATION_FIXTURES,
} from './harness/dominoFixtures';
export type { DominoFixture } from './harness/dominoFixtures';
