import { DominoValue } from '@/game/DominoValue';
import { TrainData } from '@/game/TrainData';
import { dominoKey, generateDominoSet } from '@/rules/dominoSet';
import { playMove } from '@/rules/placement';

import { createAiPlayer } from './create-ai-player';
import { defaultCandidateGenerator } from './candidate-generator';
import { getSkillProfile } from './skill-profiles';
import { isPlayAction, type AiObservation } from './types';
import { DEFAULT_TEST_RULES, mulberry32, train } from './test-fixtures';

const PLAYER_COUNT = 4;
const HAND_SIZE = 7;
const ENGINE_VALUE = 12;

interface MiniRoundState {
  trains: TrainData[];
  hands: DominoValue[][];
  drawPile: DominoValue[];
  activePlayer: number;
  turnDrawUsed: boolean;
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function dealHands(seed: number): Pick<MiniRoundState, 'hands' | 'drawPile'> {
  const rand = mulberry32(seed);
  const pool = shuffle(generateDominoSet(DEFAULT_TEST_RULES.maxPips), rand);
  const hands = Array.from({ length: PLAYER_COUNT }, () => [] as DominoValue[]);

  let index = 0;
  for (let player = 0; player < PLAYER_COUNT; player++) {
    for (let tile = 0; tile < HAND_SIZE; tile++) {
      hands[player].push(pool[index++]!);
    }
  }

  return { hands, drawPile: pool.slice(index) };
}

function initialTrains(): TrainData[] {
  return Array.from({ length: PLAYER_COUNT }, (_, playerId) =>
    train(playerId, [])
  );
}

function observation(state: MiniRoundState): AiObservation {
  return {
    selfPlayerId: state.activePlayer,
    hand: state.hands[state.activePlayer] ?? [],
    rules: DEFAULT_TEST_RULES,
    engineValue: ENGINE_VALUE,
    trains: state.trains,
    drawPileSize: state.drawPile.length,
    turnDrawUsed: state.turnDrawUsed,
  };
}

function removeFromHand(hand: DominoValue[], tile: DominoValue): void {
  const key = dominoKey(tile);
  const index = hand.findIndex((entry) => dominoKey(entry) === key);
  if (index < 0) {
    throw new Error(`tile ${key} not in hand`);
  }
  hand.splice(index, 1);
}

function advancePlayer(state: MiniRoundState): void {
  state.activePlayer = (state.activePlayer + 1) % PLAYER_COUNT;
  state.turnDrawUsed = false;
}

function tilesOnTable(trains: readonly TrainData[]): number {
  return trains.reduce((total, entry) => total + entry.dominoes.length, 0);
}

interface MiniRoundResult {
  winnerId: number | null;
  steps: number;
  tilesPlayed: number;
}

/**
 * Drives a simplified four-player Mexican Train round: empty personal trains,
 * standard draw-once-then-pass marker, and public trains after a pass.
 */
function playMiniRound(seed: number, maxSteps = 5000): MiniRoundResult {
  const { hands, drawPile } = dealHands(seed);
  const state: MiniRoundState = {
    trains: initialTrains(),
    hands,
    drawPile,
    activePlayer: 0,
    turnDrawUsed: false,
  };

  const players = Array.from({ length: PLAYER_COUNT }, (_, index) =>
    createAiPlayer({
      skill: getSkillProfile('advanced'),
      rng: mulberry32(seed * 100 + index + 1),
    })
  );

  let steps = 0;
  while (steps++ < maxSteps) {
    const emptyHand = state.hands.findIndex((hand) => hand.length === 0);
    if (emptyHand >= 0) {
      return {
        winnerId: emptyHand,
        steps,
        tilesPlayed: tilesOnTable(state.trains),
      };
    }

    const obs = observation(state);
    const legal = new Set(
      defaultCandidateGenerator(obs).map((action) => action.kind)
    );
    const action = players[state.activePlayer]!.decide(obs);

    if (!legal.has(action.kind)) {
      throw new Error(
        `illegal AI action at step ${steps} seed ${seed}: ${action.kind}`
      );
    }

    if (isPlayAction(action)) {
      const target = state.trains[action.trainIndex];
      if (!target) {
        throw new Error(`missing train ${action.trainIndex}`);
      }
      const result = playMove(target, action.move, DEFAULT_TEST_RULES);
      if (!result.ok) {
        throw new Error(
          `rules rejected play at step ${steps} seed ${seed}: ${result.violations.join(',')}`
        );
      }

      state.trains[action.trainIndex] = {
        ...target,
        ...result.board,
      };
      removeFromHand(state.hands[state.activePlayer]!, action.move.tile);
      advancePlayer(state);
      continue;
    }

    if (action.kind === 'draw') {
      if (state.turnDrawUsed || state.drawPile.length === 0) {
        throw new Error(`draw not allowed at step ${steps} seed ${seed}`);
      }
      state.hands[state.activePlayer]!.push(state.drawPile.pop()!);
      state.turnDrawUsed = true;
      continue;
    }

    if (action.kind === 'pass') {
      const ownTrain = state.trains[state.activePlayer];
      if (ownTrain) {
        state.trains[state.activePlayer] = { ...ownTrain, isPublic: true };
      }
      advancePlayer(state);
      continue;
    }

    throw new Error(`unknown action ${(action as { kind: string }).kind}`);
  }

  return {
    winnerId: null,
    steps,
    tilesPlayed: tilesOnTable(state.trains),
  };
}

describe('self-play mini-round', () => {
  it('is deterministic for a fixed seed', () => {
    const first = playMiniRound(42);
    const second = playMiniRound(42);
    expect(second).toEqual(first);
  });

  it('plays twenty seeded rounds with only legal AI actions', () => {
    for (let seed = 0; seed < 20; seed++) {
      const result = playMiniRound(1000 + seed * 991);
      expect(result.steps).toBeLessThan(5000);
      expect(result.winnerId !== null || result.tilesPlayed > 0).toBe(true);
    }
  });
});
