/**
 * Model-agnostic lookahead ("gaming it out").
 *
 * The greedy policy ({@link createPolicyPlayer}) scores the *current* options
 * with handcrafted heuristics. Search instead *simulates*: it applies an action
 * to a forward model, lets the game continue for a few plies, and evaluates the
 * resulting position. With imperfect information (hidden hands, an unknown draw
 * order) we can't do plain minimax, so we use **determinized depth-limited
 * search** (a.k.a. Perfect-Information Monte Carlo):
 *
 *   1. sample a plausible full world consistent with what we can see,
 *   2. run depth-limited paranoid minimax in that now-perfect-information world,
 *   3. average each root action's value over several sampled worlds.
 *
 * Nothing here knows about any specific game — a caller supplies a
 * {@link SearchModel}. Warp12 plugs its engine in to get real lookahead; the
 * same core could drive any turn-based game with a forward model.
 */

import { Rng } from './policy';

export type PlayerRef = number | string;

/**
 * The forward model the search drives. Implement these over your engine:
 * `applyAction` is the transition function, `evaluate` is the leaf heuristic
 * (higher = better for `perspective`), and `determinize` samples the hidden
 * state so the search isn't allowed to peek at information a player shouldn't
 * have. `orderActions` is an optional breadth control (good move ordering lets
 * `maxBranch` prune to the promising moves).
 */
export interface SearchModel<TState, TAction> {
  legalActions(state: TState): TAction[];
  applyAction(state: TState, action: TAction): TState;
  isTerminal(state: TState): boolean;
  currentPlayer(state: TState): PlayerRef;
  /** Position value from `perspective`'s point of view (higher is better). */
  evaluate(state: TState, perspective: PlayerRef): number;
  /** Sample a concrete world consistent with `perspective`'s knowledge. */
  determinize?(state: TState, perspective: PlayerRef, rng: Rng): TState;
  /** Reorder actions best-first; the search expands only the first `maxBranch`. */
  orderActions?(state: TState, actions: TAction[]): TAction[];
}

export interface SearchOptions {
  /** Plies to look ahead, including the root action itself (>= 1). */
  depth: number;
  perspective: PlayerRef;
  rng?: Rng;
  /** Worlds to sample for imperfect-information averaging (default 1). */
  determinizations?: number;
  /** Cap candidates expanded per node (default unlimited). */
  maxBranch?: number;
}

export interface ScoredAction<TAction> {
  readonly action: TAction;
  readonly value: number;
}

function limitedActions<TState, TAction>(
  state: TState,
  model: SearchModel<TState, TAction>,
  maxBranch: number
): TAction[] {
  let actions = model.legalActions(state);
  if (model.orderActions) {
    actions = model.orderActions(state, actions);
  }
  if (Number.isFinite(maxBranch) && actions.length > maxBranch) {
    actions = actions.slice(0, maxBranch);
  }
  return actions;
}

/**
 * Paranoid minimax in a (now perfect-information) world: the perspective player
 * maximizes their own evaluation; everyone else is assumed to minimize it. This
 * is pessimistic but cheap and stable for multi-player games.
 */
function minimaxValue<TState, TAction>(
  state: TState,
  model: SearchModel<TState, TAction>,
  depth: number,
  perspective: PlayerRef,
  maxBranch: number
): number {
  if (depth <= 0 || model.isTerminal(state)) {
    return model.evaluate(state, perspective);
  }

  const actions = limitedActions(state, model, maxBranch);
  if (actions.length === 0) {
    return model.evaluate(state, perspective);
  }

  const maximizing = model.currentPlayer(state) === perspective;
  let best = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  for (const action of actions) {
    const value = minimaxValue(
      model.applyAction(state, action),
      model,
      depth - 1,
      perspective,
      maxBranch
    );
    best = maximizing ? Math.max(best, value) : Math.min(best, value);
  }
  return best;
}

/**
 * Value every root action by simulating it forward. For each action we average
 * its minimax value across `determinizations` sampled worlds. Returns one entry
 * per (ordered, breadth-capped) root action; the caller turns these values into
 * a choice (e.g. skill-scaled softmax via {@link chooseActionIndex}).
 */
export function searchActionValues<TState, TAction>(
  rootState: TState,
  model: SearchModel<TState, TAction>,
  options: SearchOptions
): ScoredAction<TAction>[] {
  const rng = options.rng ?? Math.random;
  const samples = Math.max(1, options.determinizations ?? 1);
  const maxBranch = options.maxBranch ?? Number.POSITIVE_INFINITY;
  const depth = Math.max(1, options.depth);

  const rootActions = limitedActions(rootState, model, maxBranch);

  return rootActions.map((action) => {
    let total = 0;
    for (let sample = 0; sample < samples; sample++) {
      const world = model.determinize
        ? model.determinize(rootState, options.perspective, rng)
        : rootState;
      total += minimaxValue(
        model.applyAction(world, action),
        model,
        depth - 1,
        options.perspective,
        maxBranch
      );
    }
    return { action, value: total / samples };
  });
}
