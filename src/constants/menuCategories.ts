export const MENU_CATEGORIES = [
  "Vadapav",
  "Snacks",
  "Sandviches",
  "Fries",
  "Combo",
  "Refreshment",
  "Cold Drinks",
  "Extra Cheese",
] as const;

const CATEGORY_ALIASES: Record<string, readonly string[]> = {
  Vadapav: ["Vadapav"],
  Snacks: ["Snacks", "Snack"],
  Sandviches: ["Sandviches", "Sandwiches", "Sandwich"],
  Fries: ["Fries"],
  Combo: ["Combo", "Combos"],
  Refreshment: ["Refreshment", "Refreshments"],
  "Cold Drinks": ["Cold Drinks", "Cold Drink"],
  "Extra Cheese": ["Extra Cheese"],
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
