import type { MallId } from './scene-contract';

type ExteriorApproach = {
  /** Offsets are fractions of the model's bounding sphere, not surveyed anchors. */
  shoppingFocus: readonly [number, number, number];
  bearing: readonly [number, number, number];
  focusBy: number;
  zoomRate: number;
};

/** Tuning for the existing native-scroll camera, with a shared reveal at .55–.95.
 * Both paths remain in the incumbent front three-quarter view. No new rear/roof
 * detail, floor alignment or physical basement position is inferred here.
 */
export const mallMotion: Record<MallId, ExteriorApproach> = {
  'saigon-centre': {
    // Read the tall silhouette first, then descend into the Takashimaya podium.
    shoppingFocus: [0, -.69, 0],
    bearing: [.66, .20, 1],
    focusBy: .55,
    zoomRate: 2.05,
  },
  'vincom-dong-khoi': {
    // Keep more of the broad shopping frontage in view; a small lateral drift
    // leads into the labelled shopping layers rather than diving at one bay.
    shoppingFocus: [-.06, -.62, 0],
    bearing: [.48, .22, 1],
    focusBy: .50,
    zoomRate: 1.72,
  },
};
