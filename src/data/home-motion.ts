/** One Home motion configuration shared by both mall outputs.
 * Mall name, real assets and palette tokens provide the variation; the sequence does not.
 */
export const homeMotion = {
  /** First Home arrival. 'doors' is the recommended entrance (panels plus the three-stage camera tour);
   * 'cinematic' is the quieter alternative: no panels, one gentle camera push; 'none' leaves the settled page.
   * The masked headline accompanies both 'doors' and 'cinematic'. */
  arrival: 'doors' as 'doors' | 'cinematic' | 'none',
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
