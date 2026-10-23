import { useEffect, useRef, useState } from 'react';
import type { SiteData } from '../data/site';
import type { Locale } from '../runtime/scene-contract';

const copy = {
  en: { pause: 'Pause', resume: 'Resume', pauseLabel: 'Pause the moving shop names', resumeLabel: 'Resume the moving shop names' },
  vi: { pause: 'Tạm dừng', resume: 'Tiếp tục', pauseLabel: 'Tạm dừng dải tên cửa hàng', resumeLabel: 'Tiếp tục dải tên cửa hàng' },
};

/** Real directory names for the decorative strip: mapped, current and not already shown as highlights. */
export function marqueeNames(site: SiteData, locale: Locale, exclude: string[], limit = 18) {
  const names: string[] = [];
  for (const d of site.destinations) {
    if (exclude.includes(d.id) || d.openingSoon) continue;
    if (!d.locations.some(l => l.certainty === 'area-confirmed' && l.associationDetail?.referenceStatus !== 'source-plan-only')) continue;
    const name = d.name[locale].trim();
    if (name && !names.includes(name)) names.push(name);
    if (names.length === limit) break;
  }
  return names;
}

/** A slow, low-contrast strip of tenant names behind the Discovery invitation.
 * Decorative only: it is hidden from assistive technology, stops offscreen and in hidden tabs,
 * and is static under reduced motion. The real highlights and links stay stationary.
 */
export default function DiscoveryMarquee({ names, locale }: { names: string[]; locale: Locale }) {
  const strip = useRef<HTMLDivElement>(null);
  const [chosen, setChosen] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(preference.matches);
    const tab = () => setHidden(document.hidden);
    motion(); tab();
    preference.addEventListener('change', motion);
    document.addEventListener('visibilitychange', tab);
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    if (strip.current) observer.observe(strip.current);
    return () => { preference.removeEventListener('change', motion); document.removeEventListener('visibilitychange', tab); observer.disconnect(); };
  }, []);
  if (!names.length) return null;
  const c = copy[locale];
  const playing = chosen && visible && !hidden && !reduced;
  const row = (key: string) => <span className="marquee-run" key={key}>{names.map(name => <span key={name}>{name}</span>)}</span>;
  return <div className="discovery-marquee" data-playing={playing}>
    <div className="marquee-strip" ref={strip} aria-hidden="true"><div className="marquee-track">{row('a')}{row('b')}</div></div>
    {!reduced && <button type="button" className="marquee-toggle" aria-label={chosen ? c.pauseLabel : c.resumeLabel} onClick={() => setChosen(!chosen)}>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">{chosen ? <path d="M8 5v14M16 5v14"/> : <path d="M8 5l11 7-11 7z"/>}</svg>
      <span>{chosen ? c.pause : c.resume}</span>
    </button>}
  </div>;
}
