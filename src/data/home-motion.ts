/** One Home motion configuration shared by both mall outputs.
 * Mall name, real assets and palette tokens provide the variation; the sequence does not.
 */
export const homeMotion = {
  /** First Home arrival. 'rise' (default): the real building is revealed from its base to its roof once the
   * model is ready, then sways slowly. 'doors': accent panels part over the hero, then the sway.
   * 'cinematic': one gentle camera push of at most 1.1x, then the sway. 'none': the settled page with the sway.
   * The masked headline accompanies every arrival except 'none'. */
  arrival: 'rise' as 'rise' | 'doors' | 'cinematic' | 'none',
  /** Real floor overview assembles once when it first enters view. */
  floorStack: true,
  /** Home Discovery invitation: slow tenant-name strip and a one-time entrance for the real highlights. */
  discoveryInvitation: true,
};

/** Session key: revisits within a session skip the entrance instead of replaying it.
 * Also read by the inline script in layouts/Guide.astro, which cannot import this module. */
export const arrivalSeenKey = 'mall-arrival-seen';
/** Upper bound of the entrance sequence (doors, headline, actions) in milliseconds. */
export const arrivalDuration = 1700;
