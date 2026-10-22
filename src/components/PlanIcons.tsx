import type { ReactElement } from 'react';
import type { Locale } from '../runtime/scene-contract';
import type { PlanIcon, PlanIconKind } from '../data/plan-icons';
import '../styles/plan-icons.css';

/** Pictograms drawn in a 20 x 20 box centred on the origin. */
const glyph: Record<PlanIconKind, ReactElement> = {
  escalator: <path d="M-5.5 5.5h4v-4h4v-4h4v-4" />,
  lift: <path d="M-3.4-0.8 0-4.2l3.4 3.4M-3.4 0.8 0 4.2l3.4-3.4" />,
  exit: <path d="M-1.5-5.5h-4v11h4M-1 0h7M3.6-2.6 6 0 3.6 2.6" />,
  restroom: <text y="0.4">WC</text>,
  atm: <text y="0.5">$</text>,
  info: <text y="0.6">i</text>,
};

export function PlanIconBadge({ kind, radius }: { kind: PlanIconKind; radius: number }) {
  return <g transform={`scale(${radius / 10})`}><circle r="10" />{glyph[kind]}</g>;
}

/** Facility icons placed from the mall's own floor-plan features; labels only, no routing meaning. */
export function PlanIconLayer({ icons, locale, radius }: { icons: PlanIcon[]; locale: Locale; radius: number }) {
  return <g className="plan-icons">{icons.map(icon =>
    <g key={`${icon.kind}-${icon.x}-${icon.y}`} className="plan-icon" data-kind={icon.kind} transform={`translate(${icon.x} ${icon.y})`}>
      <title>{icon.label[locale]}</title><PlanIconBadge kind={icon.kind} radius={radius} />
    </g>)}</g>;
}

const order: PlanIconKind[] = ['escalator', 'lift', 'restroom', 'exit', 'atm', 'info'];
const names: Record<PlanIconKind, { vi: string; en: string }> = {
  escalator: { en: 'Escalator', vi: 'Thang cuốn' }, lift: { en: 'Lift', vi: 'Thang máy' }, restroom: { en: 'Restrooms', vi: 'Nhà vệ sinh' },
  exit: { en: 'Emergency exit', vi: 'Lối thoát hiểm' }, atm: { en: 'ATM', vi: 'ATM' }, info: { en: 'Information', vi: 'Quầy thông tin' },
};

/** One entry per icon kind present on the floor. */
export function PlanLegend({ icons, locale }: { icons: PlanIcon[]; locale: Locale }) {
  const kinds = order.filter(kind => icons.some(icon => icon.kind === kind));
  if (!kinds.length) return null;
  return <ul className="plan-legend" aria-label={locale === 'vi' ? 'Ký hiệu' : 'Map key'}>{kinds.map(kind =>
    <li key={kind}><svg viewBox="-11 -11 22 22" width="20" height="20" aria-hidden="true" className="plan-icon" data-kind={kind}><PlanIconBadge kind={kind} radius={10} /></svg>{names[kind][locale]}</li>)}</ul>;
}
