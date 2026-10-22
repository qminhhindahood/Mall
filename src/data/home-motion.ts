/** One Home motion configuration shared by both mall outputs.
 * Mall name, real assets and palette tokens provide the variation; the sequence does not.
 */
export const homeMotion = {
  /** First Home arrival. 'doors' is the recommended entrance; 'none' leaves the settled page. */
  arrival: 'doors' as 'doors' | 'none',
  /** Real floor overview assembles once when it first enters view. */
  floorStack: true,
};

/** Session key: revisits within a session skip the entrance instead of replaying it.
 * Also read by the inline script in layouts/Guide.astro, which cannot import this module. */
export const arrivalSeenKey = 'mall-arrival-seen';
/** Upper bound of the entrance sequence (doors, headline, actions) in milliseconds. */
export const arrivalDuration = 1700;
