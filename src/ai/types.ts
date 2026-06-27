import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { RulesConfig } from '@/rules/rulesConfig';
import { Move } from '@/rules/placement';
import { GenericHeuristic, Rng, SkillProfile } from './policy';

// The skill/RNG primitives live in the model-agnostic policy core.
export type { Rng, SkillProfile } from './policy';

/**
 * Base shape every action shares. Games extend the action space by declaring
 * their own `kind` literals (e.g. Warp12's `'deploy-beacon'`) and unioning them
 * with {@link AiAction}; the scoring pipeline treats unknown kinds opaquely.
 */
export interface AiActionBase {
  readonly kind: string;
}

/** Attach `tile` at `move.end` of the train at `trainIndex` in the observation. */
export interface AiPlayAction extends AiActionBase {
  readonly kind: 'play';
  readonly trainIndex: number;
  readonly move: Move;
}

export interface AiDrawAction extends AiActionBase {
  readonly kind: 'draw';
}

export interface AiPassAction extends AiActionBase {
  readonly kind: 'pass';
}

/** The base action space shared by all double-N variants. */
export type AiAction = AiPlayAction | AiDrawAction | AiPassAction;

/** Narrows any action to a play action (kind discriminant on the base is widened). */
export function isPlayAction(action: AiActionBase): action is AiPlayAction {
  return action.kind === 'play';
}

/**
 * Everything the bot is allowed to see this turn. Game-specific extras (beacon
 * flags, fracture state, scores, turn order…) ride along in {@link meta} so
 * custom heuristics can read them without changing this interface.
 */
export interface AiObservation {
  readonly selfPlayerId: number;
  readonly hand: readonly DominoValue[];
  readonly rules: RulesConfig;
  readonly trains: readonly TrainData[];
  readonly engineValue: number;
  /** Tiles left to draw; omit for "unlimited/unknown". 0 forbids drawing. */
  readonly drawPileSize?: number;
  /**
   * Set by the host once this player has already taken their single draw this
   * turn. Standard Mexican Train allows exactly one draw when you can't play;
   * if the drawn tile still can't be played you must pass (which marks your
   * train public). When true the generator stops offering `draw`, so the bot
   * falls through to `pass` instead of draining the pile.
   */
  readonly turnDrawUsed?: boolean;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/** Shared, pre-computed turn data handed to every heuristic (built once per decision). */
export interface EvalContext {
  readonly obs: AiObservation;
  /** Canonical keys of every tile already on the table (global uniqueness). */
  readonly playedKeys: ReadonlySet<string>;
  readonly candidates: readonly AiActionBase[];
  readonly playCandidates: readonly AiPlayAction[];
  /** Tiles neither played nor in hand — the basis for tile-counting heuristics. */
  readonly unseen: readonly DominoValue[];
  readonly rng: Rng;
}

/**
 * A single, pure rule-of-thumb over the domino action space. Higher score =
 * more attractive; return 0 when it doesn't apply so it stays weight-neutral.
 * This is the domino specialization of the generic {@link GenericHeuristic}.
 */
export type Heuristic = GenericHeuristic<AiActionBase, EvalContext>;

/** Produces the legal/considered actions for a turn. Override to change rules access. */
export type CandidateGenerator<TAction extends AiActionBase = AiAction> = (
  obs: AiObservation
) => TAction[];

export interface AiPlayer<TAction extends AiActionBase = AiAction> {
  decide(obs: AiObservation): TAction;
}

export interface CreateAiPlayerOptions<TAction extends AiActionBase = AiAction> {
  skill: SkillProfile;
  /** Defaults to {@link DEFAULT_HEURISTICS}. Append your own to extend behavior. */
  heuristics?: Heuristic[];
  /** Defaults to {@link defaultCandidateGenerator}. */
  generateCandidates?: CandidateGenerator<TAction>;
  /** Defaults to `Math.random`. Inject a seeded RNG for reproducible games/tests. */
  rng?: Rng;
}
