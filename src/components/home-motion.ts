import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { arrivalDuration, arrivalSeenKey, homeMotion } from '../data/home-motion';

export type Entrance = 'rise' | 'doors' | 'cinematic' | 'settled';

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

/** Groups the heading's words by rendered line, so each line rises from its own mask.
 * Server markup numbers each word as its own line, which matches the current layouts;
 * this refines it before the reveal starts whenever words share a line.
 */
export function useTitleLines() {
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const element = heading.current;
    if (!element) return;
    const assign = () => {
      let line = -1, top = -Infinity;
      for (const word of element.querySelectorAll<HTMLElement>('.mask-word')) {
        if (Math.abs(word.offsetTop - top) > 2) { line++; top = word.offsetTop; }
        word.style.setProperty('--line', String(line));
      }
    };
    assign();
    const observer = new ResizeObserver(assign);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return heading;
}
