import { dominoKey, generateDominoSet } from '@/rules/dominoSet';
import { collectAllPlayedKeys, defaultCandidateGenerator } from './candidate-generator';
import { DEFAULT_HEURISTICS } from './heuristics';
import { GenericHeuristic, Rng, createPolicyPlayer } from './policy';
import {
  AiAction,
  AiActionBase,
  AiObservation,
  AiPlayer,
  CandidateGenerator,
  CreateAiPlayerOptions,
  EvalContext,
  isPlayAction,
} from './types';

function buildEvalContext(
  obs: AiObservation,
  candidates: readonly AiActionBase[],
  rng: Rng
): EvalContext {
  const playedKeys = collectAllPlayedKeys(obs.trains);

  const seen = new Set<string>(playedKeys);
  for (const tile of obs.hand) {
    seen.add(dominoKey(tile));
  }
  const unseen = generateDominoSet(obs.rules.maxPips).filter(
    (tile) => !seen.has(dominoKey(tile))
  );

  return {
    obs,
    playedKeys,
    candidates,
    playCandidates: candidates.filter(isPlayAction),
    unseen,
    rng,
  };
}

/**
 * Builds an offline, heuristic-driven domino player over the standard double-N
 * model. The decision flow per turn:
 *
 *   observation → candidate generator → weighted heuristics → policy → action
 *
 * Every stage is injectable: swap the generator to change rules access, append
 * heuristics (including ones that read custom `kind`s or `obs.meta`) to teach it
 * variant-specific tactics, and pick/clone a {@link SkillProfile} to set strength.
 * Pass a seeded {@link Rng} for fully reproducible games. Under the hood this is
 * a thin adapter over the model-agnostic {@link createPolicyPlayer}.
 */
export function createAiPlayer<TAction extends AiActionBase = AiAction>(
  options: CreateAiPlayerOptions<TAction>
): AiPlayer<TAction> {
  const heuristics = options.heuristics ?? DEFAULT_HEURISTICS;
  const generate: CandidateGenerator<TAction> =
    options.generateCandidates ??
    (defaultCandidateGenerator as unknown as CandidateGenerator<TAction>);
  const rng = options.rng ?? Math.random;

  return createPolicyPlayer<AiObservation, TAction, EvalContext>({
    skill: options.skill,
    heuristics: heuristics as ReadonlyArray<GenericHeuristic<TAction, EvalContext>>,
    generateCandidates: generate,
    buildContext: (obs, candidates) => buildEvalContext(obs, candidates, rng),
    fallback: () => ({ kind: 'pass' } as unknown as TAction),
    rng,
  });
}
