/**
 * Model-agnostic decision core shared by every game built on this library.
 *
 * Nothing here knows about dominoes, trains, or any specific rule set: it only
 * knows how to turn a set of candidate actions into one chosen action, given a
 * skill profile and a way to score actions. The domino-specific player
 * (`createAiPlayer`) and downstream variants (e.g. Warp12) are thin adapters
 * over {@link createPolicyPlayer}.
 */

/** Pseudo-random source in [0, 1). Inject a seeded one for deterministic play. */
export type Rng = () => number;

/**
 * The dials that define "skill". The same engine spans beginner→advanced purely
 * by changing which heuristics are active, their weights, and how sharply (or
 * randomly) the policy commits to the highest-scoring action.
 */
export interface SkillProfile {
  readonly id: string;
  /** Softmax temperature over candidate scores. 0 = argmax; higher = noisier. */
  readonly temperature: number;
  /** Probability of ignoring the policy and picking a uniformly random action. */
  readonly blunderRate: number;
  /** Plies of simulation (0 = greedy). Reserved; greedy-only in this release. */
  readonly lookaheadDepth: number;
  readonly weights: Readonly<Record<string, number>>;
  readonly enabled: ReadonlySet<string>;
}

/**
 * A single, pure rule-of-thumb over actions of type `TAction`, given a turn
 * context of type `TCtx`. Higher score = more attractive; return 0 when the
 * heuristic doesn't apply so it stays weight-neutral.
 */
export interface GenericHeuristic<TAction, TCtx> {
  readonly id: string;
  score(action: TAction, ctx: TCtx): number;
}

/** Weighted sum of the enabled heuristics for one action. */
export function scoreWithHeuristics<TAction, TCtx>(
  action: TAction,
  ctx: TCtx,
  byId: ReadonlyMap<string, GenericHeuristic<TAction, TCtx>>,
  skill: SkillProfile
): number {
  let total = 0;
  for (const id of skill.enabled) {
    const heuristic = byId.get(id);
    if (!heuristic) continue;
    const weight = skill.weights[id] ?? 1;
    total += weight * heuristic.score(action, ctx);
  }
  return total;
}

/** Index of the max score, breaking ties uniformly at random. */
export function argmaxIndex(scores: readonly number[], rng: Rng): number {
  let best = Number.NEGATIVE_INFINITY;
  let tied: number[] = [];
  scores.forEach((score, index) => {
    if (score > best) {
      best = score;
      tied = [index];
    } else if (score === best) {
      tied.push(index);
    }
  });
  return tied[Math.floor(rng() * tied.length)];
}

/** Sample an index proportional to exp(score / temperature). */
export function softmaxIndex(
  scores: readonly number[],
  temperature: number,
  rng: Rng
): number {
  const max = Math.max(...scores);
  const weights = scores.map((score) => Math.exp((score - max) / temperature));
  const sum = weights.reduce((acc, value) => acc + value, 0);

  let threshold = rng() * sum;
  for (let i = 0; i < weights.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) return i;
  }
  return weights.length - 1;
}

/** Temperature-controlled choice: argmax at 0, softmax sampling above it. */
export function chooseActionIndex(
  scores: readonly number[],
  skill: SkillProfile,
  rng: Rng
): number {
  if (scores.length <= 1) return 0;
  if (skill.temperature <= 0) return argmaxIndex(scores, rng);
  return softmaxIndex(scores, skill.temperature, rng);
}

export interface PolicyPlayerConfig<TObs, TAction, TCtx> {
  skill: SkillProfile;
  heuristics: ReadonlyArray<GenericHeuristic<TAction, TCtx>>;
  generateCandidates: (obs: TObs) => TAction[];
  buildContext: (obs: TObs, candidates: readonly TAction[]) => TCtx;
  /** Returned when the generator yields no candidates at all. */
  fallback: (obs: TObs) => TAction;
  rng?: Rng;
}

export interface PolicyPlayer<TObs, TAction> {
  decide(obs: TObs): TAction;
}

/**
 * The reusable decision engine. Per turn:
 *
 *   observation → candidates → (blunder?) → weighted heuristics → policy → action
 *
 * Context is built once per decision and shared across heuristics. A single
 * candidate short-circuits scoring; an empty set returns `fallback`.
 */
export function createPolicyPlayer<TObs, TAction, TCtx>(
  config: PolicyPlayerConfig<TObs, TAction, TCtx>
): PolicyPlayer<TObs, TAction> {
  const { skill, generateCandidates, buildContext, fallback } = config;
  const rng = config.rng ?? Math.random;
  const byId = new Map(config.heuristics.map((heuristic) => [heuristic.id, heuristic] as const));

  return {
    decide(obs) {
      const candidates = generateCandidates(obs);
      if (candidates.length === 0) return fallback(obs);
      if (candidates.length === 1) return candidates[0];
      if (skill.blunderRate > 0 && rng() < skill.blunderRate) {
        return candidates[Math.floor(rng() * candidates.length)];
      }

      const ctx = buildContext(obs, candidates);
      const scores = candidates.map((candidate) =>
        scoreWithHeuristics(candidate, ctx, byId, skill)
      );
      return candidates[chooseActionIndex(scores, skill, rng)];
    },
  };
}
