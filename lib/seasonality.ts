// Recipe seasonality resolution. A recipe's "active months" are derived from its
// seasonMode:
//   ALWAYS  → every month (1–12)
//   MANUAL  → its explicit seasonMonths
//   AUTO    → the union of the in-season months of its PRIMARY ingredients,
//             matched against the produce dataset (lib/produce.ts via
//             getProduce(), from lib/data/seasonality.json).
// Pure (no DB, no network): pass the produce list in. No external runtime API.

import { ingredientMatches, type Produce } from "@/lib/seasons-data";

export type SeasonMode = "AUTO" | "MANUAL" | "ALWAYS";

export type RecipeSeasonInput = {
  seasonMode: SeasonMode;
  seasonMonths: number[];
  recipeIngredients: { isPrimary: boolean; ingredient: { name: string } }[];
};

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const cleanMonths = (months: number[]): number[] =>
  [...new Set(months.filter((m) => Number.isInteger(m) && m >= 1 && m <= 12))].sort(
    (a, b) => a - b,
  );

/** Months (1–12) during which a recipe is considered in season. */
export function getRecipeActiveMonths(
  recipe: RecipeSeasonInput,
  produce: Produce[],
): number[] {
  if (recipe.seasonMode === "ALWAYS") return [...ALL_MONTHS];
  if (recipe.seasonMode === "MANUAL") return cleanMonths(recipe.seasonMonths);

  // AUTO: union of the primary ingredients' in-season months.
  const months = new Set<number>();
  for (const ri of recipe.recipeIngredients) {
    if (!ri.isPrimary) continue;
    for (const p of produce) {
      if (ingredientMatches(ri.ingredient.name, p)) {
        for (const m of p.months) months.add(m);
      }
    }
  }
  return [...months].sort((a, b) => a - b);
}
