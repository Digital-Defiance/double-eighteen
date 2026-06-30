import {
  dominoKey,
  orientForConnection,
  tileHasValue,
} from '@/rules/dominoSet';
import { AiPlayAction, Heuristic, isPlayAction } from './types';

/** Stable ids so skill profiles and overrides can reference heuristics by name. */
export const HEURISTIC_IDS = {
  preferPlay: 'prefer-play',
  dumpPips: 'dump-pips',
  doublesEarly: 'play-doubles-early',
  ownTrain: 'own-train',
  obligationRelief: 'obligation-relief',
  handFlexibility: 'hand-flexibility',
  defensivePublic: 'defensive-public',
} as const;

/** Pip value the open end will expose after this tile is oriented and placed. */
function newOpenEndValue(action: AiPlayAction): number {
  const oriented = orientForConnection(action.move.tile, action.move.end.value);
  return oriented ? oriented.value2 : action.move.tile.value2;
}

/**
 * Strongly favors playing over drawing, and drawing over passing. This is the
 * baseline that keeps every competent profile playing whenever it legally can;
 * mistakes come from the blunder rate, not from declining a free play.
 */
const preferPlay: Heuristic = {
  id: HEURISTIC_IDS.preferPlay,
  score(action) {
    if (action.kind === 'play') return 100;
    if (action.kind === 'draw') return 0;
    return -50;
  },
};

/** Offload weight: shed the heaviest tiles first to minimize end-of-round points. */
const dumpPips: Heuristic = {
  id: HEURISTIC_IDS.dumpPips,
  score(action) {
    if (!isPlayAction(action)) return 0;
    const tile = action.move.tile;
    return tile.value1 + tile.value2;
  },
};

/** Doubles are hard to get rid of late; nudge the bot to play them while its hand is full. */
const playDoublesEarly: Heuristic = {
  id: HEURISTIC_IDS.doublesEarly,
  score(action, ctx) {
    if (!isPlayAction(action)) return 0;
    const tile = action.move.tile;
    if (tile.value1 !== tile.value2) return 0;
    return Math.min(ctx.obs.hand.length, 12);
  },
};

/** Playing on your own train keeps it active (shields up) and under your control. */
const ownTrain: Heuristic = {
  id: HEURISTIC_IDS.ownTrain,
  score(action, ctx) {
    if (!isPlayAction(action)) return 0;
    const train = ctx.obs.trains[action.trainIndex];
    return train && train.playerId === ctx.obs.selfPlayerId ? 8 : 0;
  },
};

/** Clearing an outstanding obligation (e.g. covering a double) unblocks the board. */
const obligationRelief: Heuristic = {
  id: HEURISTIC_IDS.obligationRelief,
  score(action) {
    if (!isPlayAction(action)) return 0;
    return action.move.end.obligation ? 10 : 0;
  },
};

/**
 * Rewards leaving yourself a follow-up: how many of your remaining tiles can
 * attach to the new open end this move creates. Encourages building runs you
 * can actually continue rather than stranding yourself.
 */
const handFlexibility: Heuristic = {
  id: HEURISTIC_IDS.handFlexibility,
  score(action, ctx) {
    if (!isPlayAction(action)) return 0;
    const endValue = newOpenEndValue(action);
    const playedKey = dominoKey(action.move.tile);

    let skipped = false;
    let matches = 0;
    for (const tile of ctx.obs.hand) {
      if (!skipped && dominoKey(tile) === playedKey) {
        skipped = true; // don't count the tile we're about to play
        continue;
      }
      if (tileHasValue(tile, endValue)) matches++;
    }
    return matches * 3;
  },
};

/**
 * Defensive play on shared/opponent trains: prefer leaving an open end that is
 * hard for others to extend (few unseen tiles match it). Neutral on your own
 * train, where flow is desirable instead.
 */
const defensivePublic: Heuristic = {
  id: HEURISTIC_IDS.defensivePublic,
  score(action, ctx) {
    if (!isPlayAction(action)) return 0;
    const train = ctx.obs.trains[action.trainIndex];
    if (!train || train.playerId === ctx.obs.selfPlayerId) return 0;

    const endValue = newOpenEndValue(action);
    let openCount = 0;
    for (const tile of ctx.unseen) {
      if (tileHasValue(tile, endValue)) openCount++;
    }
    return -openCount;
  },
};

/** The stock, game-agnostic heuristic set. Append/replace by `id` to customize. */
export const DEFAULT_HEURISTICS: Heuristic[] = [
  preferPlay,
  dumpPips,
  playDoublesEarly,
  ownTrain,
  obligationRelief,
  handFlexibility,
  defensivePublic,
];
