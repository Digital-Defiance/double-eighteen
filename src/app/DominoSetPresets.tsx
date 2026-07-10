import { FC } from 'react';

import { DominoTile, type DominoTileProps } from './DominoTile';

/** @deprecated Use DominoTileProps instead. */
export type DoubleTwelveProps = DominoTileProps;

/** Double-18 domino tile (primary export). */
export const DoubleEighteen: FC<Omit<DominoTileProps, 'maxPips'>> = (props) => (
  <DominoTile maxPips={18} {...props} />
);

/** Double-15 domino tile. */
export const DoubleFifteen: FC<Omit<DominoTileProps, 'maxPips'>> = (props) => (
  <DominoTile maxPips={15} {...props} />
);

/** Double-12 domino tile. */
export const DoubleTwelve: FC<Omit<DominoTileProps, 'maxPips'>> = (props) => (
  <DominoTile maxPips={12} {...props} />
);

/** Double-9 domino tile. */
export const DoubleNine: FC<Omit<DominoTileProps, 'maxPips'>> = (props) => (
  <DominoTile maxPips={9} {...props} />
);

export { DominoTile };
export type { DominoTileProps };

export default DoubleEighteen;
