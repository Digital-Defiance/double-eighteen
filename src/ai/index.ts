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
  CandidateGenerator,
  AiPlayer,
  CreateAiPlayerOptions,
} from './types';
export { isPlayAction } from './types';

export type { CandidateGeneratorOptions } from './candidate-generator';
export {
  getAccessibleTrainIndices,
  collectAllPlayedKeys,
  generatePlayActions,
  createCandidateGenerator,
  defaultCandidateGenerator,
} from './candidate-generator';

export { HEURISTIC_IDS, DEFAULT_HEURISTICS } from './heuristics';

export type { SkillLevel } from './skill-profiles';
export { SKILL_PRESETS, getSkillProfile } from './skill-profiles';

export { createAiPlayer } from './create-ai-player';

// Generic, model-agnostic decision core (reuse to build AIs for other variants).
export type {
  GenericHeuristic,
  PolicyPlayer,
  PolicyPlayerConfig,
} from './policy';
export {
  scoreWithHeuristics,
  argmaxIndex,
  softmaxIndex,
  chooseActionIndex,
  createPolicyPlayer,
} from './policy';

// Generic lookahead/search ("game it out"); plug in a forward model.
export type {
  PlayerRef,
  SearchModel,
  SearchOptions,
  ScoredAction,
} from './search';
export { searchActionValues } from './search';
