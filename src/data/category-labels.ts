import type { DirectorySnapshot } from './content';

/** Presentation wording only: the approved directory snapshot keeps its recorded bytes and hashes. */
const vietnameseNames: Record<string, string> = { 'category-pending': 'Khác' };
const vietnameseCuisines: Record<string, string> = { Singaporean: 'Singapore', American: 'Mỹ', French: 'Pháp', Taiwanese: 'Đài Loan', Australian: 'Úc' };

export function relabelCategories(content: DirectorySnapshot): DirectorySnapshot {
  return {
    ...content,
    categories: content.categories.map(category => vietnameseNames[category.id] ? { ...category, name: { ...category.name, vi: vietnameseNames[category.id] } } : category),
    destinations: content.destinations.map(destination => destination.cuisine && destination.cuisine.vi === destination.cuisine.en && vietnameseCuisines[destination.cuisine.vi] ? { ...destination, cuisine: { ...destination.cuisine, vi: vietnameseCuisines[destination.cuisine.vi] } } : destination),
  };
}
