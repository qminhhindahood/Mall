import type { DirectorySnapshot } from './content';

/** Presentation wording only: the approved directory snapshot keeps its recorded bytes and hashes. */
const vietnameseNames: Record<string, string> = { 'category-pending': 'Khác' };

export function relabelCategories(content: DirectorySnapshot): DirectorySnapshot {
  return { ...content, categories: content.categories.map(category => vietnameseNames[category.id] ? { ...category, name: { ...category.name, vi: vietnameseNames[category.id] } } : category) };
}
