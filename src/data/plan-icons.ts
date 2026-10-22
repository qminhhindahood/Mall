import saigonCentre from '../../data/malls/saigon-centre/plan-icons.json';
import vincomDongKhoi from '../../data/malls/vincom-dong-khoi/plan-icons.json';

export type PlanIconKind = 'escalator' | 'lift' | 'restroom' | 'exit' | 'atm' | 'info';
export type PlanIcon = { kind: PlanIconKind; x: number; y: number; label: { vi: string; en: string } };

const byMall: Record<string, Record<string, PlanIcon[]>> = {
  'saigon-centre': saigonCentre.floors as Record<string, PlanIcon[]>,
  'vincom-dong-khoi': vincomDongKhoi.floors as Record<string, PlanIcon[]>,
};

/** Visual facility labels for one floor; empty where the mall has no extracted source features. */
export const planIcons = (mallId: string, floorId: string): PlanIcon[] => byMall[mallId]?.[floorId] ?? [];
