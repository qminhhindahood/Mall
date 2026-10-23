import type { DirectorySnapshot, Destination } from './content';

type BrandSupplement = {
  mallId: string; revision: string;
  counts: { destinations: number };
  destinations: (Destination & { officialCategories?: string[] })[];
};

/**
 * Adds the department store's own brands as basic listings (name, category, floor).
 * They carry no mapped area, so they stay floor-level until a plan unit is reviewed.
 */
export function applyTakashimayaBrands(content: DirectorySnapshot, supplement: BrandSupplement): DirectorySnapshot {
  if (content.mallId !== supplement.mallId) return content;
  const taken = new Set(content.destinations.map(destination => destination.id));
  if (supplement.destinations.length !== supplement.counts.destinations || supplement.destinations.some(destination => taken.has(destination.id)))
    throw new Error(`Takashimaya brand supplement ${supplement.revision} does not match the directory`);
  const additions = supplement.destinations.map(({ officialCategories: _official, ...destination }) => destination);
  return { ...content, destinations: [...content.destinations, ...additions] };
}
