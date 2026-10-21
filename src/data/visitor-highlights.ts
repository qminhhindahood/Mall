import type { MallId } from '../runtime/scene-contract';

// Editorial starting points for the unpublished redesign, not a popularity,
// sponsorship, current-occupancy or route-availability claim. All displayed
// names, floors and details are resolved from the approved directory.
export const visitorHighlightIds: Record<MallId, string[]> = {
  'saigon-centre': ['saigon-prototype-meatmeet', 'saigon-prototype-calvinklein', 'saigon-prototype-mlb', 'saigon-prototype-annamgourmet', 'saigon-prototype-takashimaya', 'saigon-prototype-longjing'],
  'vincom-dong-khoi': ['vincom-prototype-zara', 'vincom-prototype-meatmeet', 'vincom-prototype-cgv', 'vincom-prototype-hm', 'vincom-prototype-starbucks', 'vincom-prototype-mlb'],
};
