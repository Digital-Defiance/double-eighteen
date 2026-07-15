/**
 * Distance from the hub center at which a train should start so its first tile
 * clears its neighbours. Trains fan out 360/slots° apart, so the neighbour gap
 * at distance d is ~2πd/slots; it must exceed a tile's footprint. Offset trains
 * zigzag wider (a perpendicular half-tile seed) and need a bigger ring; linear
 * trains are skinny and stay near the hub. Never smaller than `radius + 20`.
 *
 * Pure geometry — no React — so it lives in the headless core and is shared by
 * the `DominoHub` component (in `double-eighteen-react`) and layout adapters.
 */
export function hubTrainStartDistance(
  slots: number,
  radius: number,
  dominoWidth: number,
  layoutStyle: 'offset' | 'linear'
): number {
  const minNeighborGap = dominoWidth * (layoutStyle === 'offset' ? 2.5 : 1.3);
  return Math.max(
    radius + 20,
    Math.ceil((minNeighborGap * slots) / (2 * Math.PI))
  );
}
