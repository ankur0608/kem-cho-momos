export const MENU_CATEGORIES = [
  "MOMOS",
  "MAGGI",
  "BEVERAGES / SHAKES",
  "FRENCH FRIES",
  "COMBOS",
] as const;

export function getMenuCategoryVariants(category: string): string[] {
  return [category.trim()];
}

export function normalizeMenuCategory(category: string): string {
  return category.trim();
}

export function getSortedMenuCategories(categories: string[]): string[] {
  return [...new Set(categories.map(normalizeMenuCategory))].sort((a, b) => {
    const indexA = MENU_CATEGORIES.indexOf(a as (typeof MENU_CATEGORIES)[number]);
    const indexB = MENU_CATEGORIES.indexOf(b as (typeof MENU_CATEGORIES)[number]);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) {
      return -1;
    }

    if (indexB !== -1) {
      return 1;
    }

    return a.localeCompare(b);
  });
}
