# double-eighteen

[![npm](https://img.shields.io/npm/v/double-eighteen.svg)](https://www.npmjs.com/package/double-eighteen)
[![downloads](https://img.shields.io/npm/dm/double-eighteen.svg)](https://www.npmjs.com/package/double-eighteen)
[![minzip](https://img.shields.io/bundlephobia/minzip/double-eighteen.svg)](https://bundlephobia.com/package/double-eighteen)
[![types](https://img.shields.io/npm/types/double-eighteen.svg)](https://www.npmjs.com/package/double-eighteen)
[![CI](https://github.com/Digital-Defiance/double-eighteen/actions/workflows/ci.yml/badge.svg)](https://github.com/Digital-Defiance/double-eighteen/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/double-eighteen.svg)](./LICENSE)

Headless engine for **Mexican Train / multi-trail dominoes** across the double-9, -12, -15, and -18 sets. Rules, legal-move generation, an extensible heuristic AI, and all the train / hub / chicken-foot **layout geometry** — with **zero UI dependencies** (no React, no DOM).

> **Want ready-made React components?** See the companion package
> **[`double-eighteen-react`](https://www.npmjs.com/package/double-eighteen-react)**,
> which renders everything this package computes. **▶ [Live demo](https://digital-defiance.github.io/double-eighteen-react/)**

**In production:** `double-eighteen` powers the rules, AI, and board geometry behind **[Warp 12](https://warp12.app)** — federation-themed multi-trail dominoes for web, desktop (Tauri), and mobile.

## Why

Most domino packages on npm are just tile artwork. `double-eighteen` is the part that's actually hard:

- **Every double-N set** — 9 / 12 / 15 / 18, with correct tile counts and engine values.
- **A real rules engine** — open ends, unsatisfied doubles ("Red Alert"), chicken-foot obligations, full legal-move enumeration, and *immutable* move application.
- **Layout geometry** — linear, brick-offset, and recursive chicken-foot train layouts with overlap / self-intersection detection and bounds; plus hub placement and pan/zoom viewport math.
- **Built-in AI opponents** — an injectable `observation → candidates → heuristics → policy` pipeline with beginner / intermediate / advanced presets and a seedable RNG for fully reproducible games.
- **Framework-agnostic & tree-shakeable** — pure ESM **and** CJS, `sideEffects: false`, ships its own type declarations.

## Install

```bash
npm install double-eighteen
```

No peer dependencies — it's pure TypeScript/JavaScript.

## Quick start

### Sets & rules

```ts
import { DOMINO_SETS, generateDominoSet, resolveRulesForSet } from 'double-eighteen';

DOMINO_SETS[12];                     // { maxPips: 12, tileCount: 91, engineValue: 12 }
const tiles = generateDominoSet(12); // all 91 unique double-12 tiles
const rules = resolveRulesForSet(12, { chickenFoot: { scope: 'all-doubles' } });
```

### Legal moves & playing a tile (immutable)

```ts
import { getLegalMoves, playMove } from 'double-eighteen';

// A `TrainBranch` is a train's tile chain. Start from an empty branch:
const root = { dominoes: [] };
const hand = [{ value1: 12, value2: 5 }, { value1: 3, value2: 3 }];

const moves = getLegalMoves(root, /* startValue */ 12, hand, new Set(), rules);
const result = playMove(root, moves[0], rules); // returns a NEW board; never mutates
if (result.ok) console.log(result.board);
```

### An AI opponent

```ts
import { createAiPlayer, getSkillProfile } from 'double-eighteen';

const ai = createAiPlayer({ skill: getSkillProfile('advanced') });
const action = ai.decide({
  selfPlayerId: 0,
  hand,
  rules,
  trains: [],
  engineValue: 12,
});
// → { kind: 'play', … } | { kind: 'draw' } | { kind: 'pass' }
```

Pass `{ rng }` (a seeded `() => number`) to `createAiPlayer` for deterministic games,
or append your own `heuristics` to teach it variant-specific tactics.

### Train layout geometry

```ts
import { computeTrainLayout, getTrainLayoutBounds } from 'double-eighteen';
// Compute each tile's position + rotation for a train (linear | offset | chicken-foot),
// ready to hand to any renderer. `double-eighteen-react` is a thin consumer of this.
```

## What's included

| Layer | Key exports |
|-------|-------------|
| **Sets / variants** | `DOMINO_SETS`, `generateDominoSet`, `normalizeSetSize`, `clampPipValue`, `resolveRulesForSet` |
| **Rules** | `getLegalMoves`, `evaluatePlacement`, `applyMove`, `playMove`, `getOpenEnds`, `getUnsatisfiedDoubles`, `DEFAULT_RULES`, `resolveRules` |
| **AI** | `createAiPlayer`, `getSkillProfile`, `SKILL_PRESETS`, `createPolicyPlayer`, `searchActionValues`, `DEFAULT_HEURISTICS`, `createCandidateGenerator` |
| **Train geometry** | `computeTrainLayout`, `computeTrainTree`, `getTrainLayoutBounds`, `tilesOverlap`, `layoutsCollide`, `layoutSelfIntersects`, `DOMINO_WIDTH`, `DOMINO_HEIGHT`, `CHICKEN_FOOT_TOE_ANGLES` |
| **Bends / hub / viewport** | `resolveBend`, `withBendAt`, `hubTrainStartDistance`, `fitToBounds`, `zoomAt`, `screenToContent` |
| **Theming data** | `DEFAULT_DOMINO_THEME`, `mergeDominoTheme`, `themeDataAttributes`, `DEFAULT_PIP_COLORS`, `PIP_LAYOUTS`, `getPipLayout` |
| **Validation / fixtures** | `validateTrainLayout`, `validateTrainTree`, `validateChickenFootChain`, `TRAIN_FIXTURES`, `CHICKEN_FOOT_FIXTURES`, `generateSampleTrains` |
| **Types** | `DominoValue`, `TrainData`, `TrainBranch`, `GameState`, `RulesConfig`, `Move`, `AiPlayer`, `SkillProfile`, `DominoSetSize`, … |

## Companion package

| Package | Role |
|---------|------|
| **`double-eighteen`** (this) | Headless rules, AI, and layout/geometry math. No UI. |
| **[`double-eighteen-react`](https://www.npmjs.com/package/double-eighteen-react)** | React components that render dominoes, trains, and the Mexican Train hub using this engine. |

## Development

This package is a standalone [Nx](https://nx.dev) workspace (also vendored as a submodule of the [Warp](https://github.com/Digital-Defiance) project).

```bash
yarn install
yarn test           # unit tests (Vitest)
yarn typecheck      # tsc, no emit
yarn build:lib      # build the npm package → dist/
yarn pack:dry-run   # preview the published tarball
```

## Publishing (local)

`publishConfig.registry` is pinned to npm; `prepublishOnly` runs the tests +
`build:lib` before the tarball is created.

```bash
npm publish --access public   # prompts for your npm 2FA one-time password
```

## License

MIT © Digital Defiance, Jessica Mulein
