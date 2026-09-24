export const MENU_CATEGORIES = [
  "Steamed Momos",
  "Fried Momos",
  "Kurkure Momos",
  "Pan Fried Momos",
  "Tandoori Momos",
  "Gravy Momos",
  "Beverages",
  "Combos",
] as const;

const CATEGORY_ALIASES: Record<string, readonly string[]> = {
  "Steamed Momos": ["Steamed Momos", "Steamed Momo", "Steam Momos"],
  "Fried Momos": ["Fried Momos", "Fried Momo", "Fry Momos"],
  "Kurkure Momos": ["Kurkure Momos", "Kurkure Momo"],
  "Pan Fried Momos": ["Pan Fried Momos", "Pan Fried Momo", "Pan Fry Momos"],
  "Tandoori Momos": ["Tandoori Momos", "Tandoori Momo"],
  "Gravy Momos": ["Gravy Momos", "Gravy Momo"],
  "Beverages": ["Beverages", "Beverage", "Cold Drinks", "Drinks"],
  "Combos": ["Combos", "Combo"],
};

export function getMenuCategoryVariants(category: string): string[] {
  const normalizedCategory = normalizeMenuCategory(category);
  return [...(CATEGORY_ALIASES[normalizedCategory] ?? [category.trim()])];
}

export function normalizeMenuCategory(category: string): string {
  const trimmedCategory = category.trim();

  for (const [canonicalCategory, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === trimmedCategory.toLowerCase())) {
      return canonicalCategory;
    }
  }

  return trimmedCategory;
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
