import { useEffect, useState } from 'react';
import { arrivalDuration, arrivalSeenKey, homeMotion } from '../data/home-motion';

export type Entrance = 'doors' | 'cinematic' | 'settled';

/** Coordinates the first Home arrival. The entrance itself is CSS, so a slow or
 * failed model, or a failed script, can never leave the doors covering the page.
 * Pointer, keyboard, wheel or touch intent settles it at once; revisits skip it.
 */
export function useHomeEntrance(home: boolean): Entrance {
  const [entrance, setEntrance] = useState<Entrance>(home && homeMotion.arrival !== 'none' ? homeMotion.arrival : 'settled');
  useEffect(() => {
    if (entrance === 'settled') return;
    let seen = false;
    try { seen = sessionStorage.getItem(arrivalSeenKey) === '1'; sessionStorage.setItem(arrivalSeenKey, '1'); } catch {}
    // The layout's inline script marks intent before hydration; CSS has already settled the page.
    if (document.documentElement.hasAttribute('data-arrival-seen')) seen = true;
    if (seen || matchMedia('(prefers-reduced-motion: reduce)').matches) { setEntrance('settled'); return; }
    const settle = () => setEntrance('settled');
    const timer = setTimeout(settle, arrivalDuration);
    const intents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    // Visitor intent only: the scene's own focus/scroll settling must not cut the entrance short.
    // Scrollbar drags, wheels and keyboard scrolling all arrive through these events.
    for (const type of intents) window.addEventListener(type, settle, { passive: true, once: true });
    return () => {
      clearTimeout(timer);
      for (const type of intents) window.removeEventListener(type, settle);
    };
  }, [entrance]);
  return entrance;
}
