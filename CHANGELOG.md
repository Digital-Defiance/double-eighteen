# Changelog

All notable changes to `double-eighteen` are documented here. This project adheres
to [Semantic Versioning](https://semver.org/) and the format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.4.1] - 2026-07-14

### Added

- Exposed the domino reference fixtures on the public barrel so the
  `double-eighteen-react` visual harness/demo can consume them:
  `doubleFixtures`, `DOUBLE_FIXTURES`, `mixedFixtures`, `MIXED_FIXTURES`,
  `halfOrientationFixtures`, `ROTATION_FIXTURES`, and the `DominoFixture` type
  (joining the already-exported `parseSetParam`, `TRAIN_FIXTURES`, and
  `CHICKEN_FOOT_FIXTURES`).

## [0.4.0] - 2026-07-14

### Changed (breaking)

- **`double-eighteen` is now headless.** All React components have moved to the new
  companion package [`double-eighteen-react`](https://www.npmjs.com/package/double-eighteen-react).
  This package now ships only pure rules, AI, layout/geometry math, and theming data —
  no React, no DOM.
- Removed the `react` / `react-dom` peer dependencies. There are now **no peer
  dependencies**.

### Removed

- Component exports (`DoubleEighteen`/`DoubleFifteen`/`DoubleTwelve`/`DoubleNine`,
  `DominoTile`, `DominoTrain`, `DominoHub`, `MexicanTrainGame`, `Viewport`,
  `DominoThemeProvider`, `DefaultPip`, …) — import these from `double-eighteen-react`.

### Added

- `hubTrainStartDistance()` — the pure hub-placement geometry previously embedded in
  the `DominoHub` component.
- `DOMINO_WIDTH` / `DOMINO_HEIGHT` are now part of the public barrel.

### Migration

```diff
- import { MexicanTrainGame, computeTrainLayout } from 'double-eighteen';
+ import { computeTrainLayout } from 'double-eighteen';
+ import { MexicanTrainGame } from 'double-eighteen-react';
```

Install the React layer alongside the core:

```bash
npm install double-eighteen double-eighteen-react react react-dom
```

## [0.3.3] - 2026

- Last release that bundled the React rendering components together with the engine.
