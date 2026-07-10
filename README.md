# double-eighteen

Double-9/12/15/18 Mexican Train dominoes for React — tile rendering, train layout (linear, offset, chicken foot), and a configurable rules engine.

## Install

```bash
npm install double-eighteen
# peer dependency
npm install react react-dom
```

## Quick start

```tsx
import { DoubleEighteen, MexicanTrainGame, DEFAULT_PIP_COLORS } from 'double-eighteen';

// Single tile
<DoubleEighteen value1={6} value2={3} pipColors={DEFAULT_PIP_COLORS} />

// Full demo table (generates sample trains on mount)
<MexicanTrainGame width={1200} height={800} />
```

## What's included

| Layer | Exports |
|-------|---------|
| **Components** | `DoubleEighteen`, `DominoTrain`, `DominoHub`, `MexicanTrainGame` |
| **Layout** | `computeTrainLayout`, `computeTrainTree`, overlap detection, bounds |
| **Rules** | `playMove`, `getLegalMoves`, `resolveRules`, domino set helpers |
| **Theming** | `DEFAULT_PIP_COLORS`, `mergePipColors`, pip layout grids |
| **Validation** | `validateTrainLayout`, `validateTrainTree`, test fixtures |

## Layout styles

- **`linear`** — tiles run straight along the train axis
- **`offset`** — brick-style zigzag in two fixed rows; doubles center inbound/outbound tiles
- **Chicken foot** — doubles fan three toes (±45° + center); recursive via `computeTrainTree`

## Development (this repo)

```bash
yarn install
yarn start          # demo app + visual harnesses at localhost:4200
yarn test           # unit tests
yarn build:lib      # npm package → dist/
yarn pack:dry-run   # preview the published tarball
```

Harness routes (local demo): `/`, `/harness`, `/harness/pips?set=18`, `/harness/dominoes`, `/harness/trains`, `/harness/chicken-foot?layout=offset`

## Publish to npm

This package is configured to publish to the public registry at [npmjs.com](https://www.npmjs.com/package/double-eighteen).

```bash
# one-time: log in (opens browser or prompts for OTP)
npm login --registry=https://registry.npmjs.org/

# dry run
yarn pack:dry-run

# publish (runs tests + build:lib via prepublishOnly)
npm publish
```

`publishConfig.registry` in `package.json` and `.npmrc` both point at `https://registry.npmjs.org/`, so publish won't accidentally go to GitHub Packages or another registry even if your global npm config differs.

**CI / automation:** set an npm automation token as `NPM_TOKEN` and run:

```bash
npm publish --provenance --access public
```

(Provenance is optional but recommended for supply-chain transparency on npm.)

## License

MIT
