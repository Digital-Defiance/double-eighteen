// Components
export { DominoTile } from './app/DominoTile';
export type { DominoTileProps } from './app/DominoTile';
export {
  DoubleEighteen,
  DoubleFifteen,
  DoubleTwelve,
  DoubleNine,
} from './app/DominoSetPresets';
export type { DoubleTwelveProps } from './app/DominoSetPresets';
export { MexicanTrainGame } from './app/MexicanTrainGame';
export { DominoHub, hubTrainStartDistance } from './app/DominoHub';
export { DominoTrain } from './app/DominoTrain';
export { DominoThemeProvider, useDominoTheme } from './app/DominoThemeContext';
export type { DominoThemeProviderProps } from './app/DominoThemeContext';
export { DefaultPip } from './app/DefaultPip';
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
