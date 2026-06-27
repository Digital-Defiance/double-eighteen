import { TrainData } from '@/game/TrainData';
import { collectPlayedKeys, getLegalMoves } from '@/rules/placement';
import {
  AiAction,
  AiObservation,
  AiPlayAction,
  CandidateGenerator,
} from './types';

/**
 * Indices (into `obs.trains`) the player may legally build on under standard
 * Mexican Train access: your own train, plus any train flagged public. Games
 * with richer access rules (Warp12's Distress Beacon, locked fractures, …)
 * supply their own {@link CandidateGenerator}.
 */
export function getAccessibleTrainIndices(obs: AiObservation): number[] {
  const indices: number[] = [];
  obs.trains.forEach((train, index) => {
    if (train.playerId === obs.selfPlayerId || train.isPublic) {
      indices.push(index);
    }
  });
  return indices;
}

/** Union of every played tile's key across all trains (uniqueness is global). */
export function collectAllPlayedKeys(
  trains: readonly TrainData[]
): Set<string> {
  const keys = new Set<string>();
  for (const train of trains) {
    for (const key of collectPlayedKeys(train)) {
      keys.add(key);
    }
  }
  return keys;
}

/** Every legal placement of a hand tile onto an accessible train. */
export function generatePlayActions(obs: AiObservation): AiPlayAction[] {
  const playedKeys = collectAllPlayedKeys(obs.trains);
  const actions: AiPlayAction[] = [];

  for (const trainIndex of getAccessibleTrainIndices(obs)) {
    const train = obs.trains[trainIndex];
    const moves = getLegalMoves(
      train,
      obs.engineValue,
      obs.hand,
      playedKeys,
      obs.rules
    );
    for (const move of moves) {
      actions.push({ kind: 'play', trainIndex, move });
    }
  }

  return actions;
}

export interface CandidateGeneratorOptions {
  /**
   * Offer `draw` even when legal plays exist. Off by default (canonical "must
   * play if you can"). Turn on for variants where drawing is always optional —
   * combined with a high blunder rate this is what makes a beginner draw when
   * they didn't have to.
   */
  allowOptionalDraw?: boolean;
}

/**
 * Builds the standard candidate set: all legal plays, plus `draw` when the pile
 * isn't empty (and either there are no plays, or optional drawing is enabled),
 * falling back to `pass` only when nothing else is possible.
 */
export function createCandidateGenerator(
  options: CandidateGeneratorOptions = {}
): CandidateGenerator<AiAction> {
  return (obs) => {
    const plays = generatePlayActions(obs);
    const actions: AiAction[] = [...plays];

    const pileHasTiles = (obs.drawPileSize ?? Number.POSITIVE_INFINITY) > 0;
    // One draw per turn: once the host marks the draw used, the bot must pass
    // (which is what flips its own train public) rather than draw again.
    const canDraw = pileHasTiles && !obs.turnDrawUsed;
    if (canDraw && (plays.length === 0 || options.allowOptionalDraw)) {
      actions.push({ kind: 'draw' });
    }
    if (actions.length === 0) {
      actions.push({ kind: 'pass' });
    }
    return actions;
  };
}

export const defaultCandidateGenerator = createCandidateGenerator();
