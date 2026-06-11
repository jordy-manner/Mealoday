// Server-side recipe search (SQL, accent-insensitive via the `unaccent`
// extension). Returns ordered recipe ids + a relevance score; the page then
// loads the card data for those ids. Server-only (raw Prisma query).

import { prisma } from "@/lib/prisma";

export type SearchParams = {
  q: string;
  byIngredient: boolean;
  category: string | null;
  maxTime: number; // 0 = any
  difficulty: number; // 0 = any
};

export type SearchHit = { id: string; score: number };

/** True when any search/filter is active (drives browse vs results view). */
export function isSearchActive(p: SearchParams): boolean {
  return p.q.trim() !== "" || p.category !== null || p.maxTime > 0 || p.difficulty > 0;
}

/**
 * Resolves matching recipe ids, ordered. In by-ingredient mode the query is
 * split on commas and each recipe is scored by the number of matching
 * ingredients (kept only if ≥ 1), ordered by score desc.
 */
export async function searchRecipeIds(p: SearchParams): Promise<SearchHit[]> {
  const params: unknown[] = [];
  const add = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };

  const conds: string[] = [];
  const q = p.q.trim();
  let scoreExpr = "0";

  if (p.byIngredient && q) {
    const terms = q.split(",").map((t) => t.trim()).filter(Boolean);
    const parts = terms.map((term) => {
      const ph = add(`%${term}%`);
      return `(EXISTS (SELECT 1 FROM "RecipeIngredient" ri JOIN "Ingredient" i ON i.id = ri."ingredientId" WHERE ri."recipeId" = r.id AND unaccent(lower(i.name)) LIKE unaccent(lower(${ph}))))::int`;
    });
    if (parts.length) {
      scoreExpr = parts.join(" + ");
      conds.push(`(${scoreExpr}) > 0`);
    }
  } else if (q) {
    const ph = add(`%${q}%`);
    conds.push(`(
      unaccent(lower(r.title)) LIKE unaccent(lower(${ph}))
      OR unaccent(lower(COALESCE(r.description, ''))) LIKE unaccent(lower(${ph}))
      OR EXISTS (SELECT 1 FROM "RecipeTag" rt JOIN "Tag" t ON t.id = rt."tagId" WHERE rt."recipeId" = r.id AND unaccent(lower(t.name)) LIKE unaccent(lower(${ph})))
      OR EXISTS (SELECT 1 FROM "RecipeCategory" rc JOIN "Category" c ON c.id = rc."categoryId" WHERE rc."recipeId" = r.id AND unaccent(lower(c.name)) LIKE unaccent(lower(${ph})))
      OR EXISTS (SELECT 1 FROM "RecipeIngredient" ri JOIN "Ingredient" i ON i.id = ri."ingredientId" WHERE ri."recipeId" = r.id AND unaccent(lower(i.name)) LIKE unaccent(lower(${ph})))
    )`);
  }

  if (p.category) {
    const ph = add(p.category);
    conds.push(
      `EXISTS (SELECT 1 FROM "RecipeCategory" rc JOIN "Category" c ON c.id = rc."categoryId" WHERE rc."recipeId" = r.id AND c.name = ${ph})`,
    );
  }
  if (p.maxTime > 0) {
    const ph = add(p.maxTime);
    conds.push(
      `(COALESCE(r."prepTime", 0) + COALESCE(r."cookTime", 0) + COALESCE(r."restTime", 0)) <= ${ph}`,
    );
  }
  if (p.difficulty > 0) {
    const ph = add(p.difficulty);
    conds.push(`r.difficulty = ${ph}`);
  }

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const orderByScore = p.byIngredient && q;
  const order = orderByScore
    ? `ORDER BY score DESC, r."createdAt" DESC`
    : `ORDER BY r."createdAt" DESC`;

  const sql = `SELECT r.id, (${scoreExpr})::int AS score FROM "Recipe" r ${where} ${order}`;
  const rows = await prisma.$queryRawUnsafe<{ id: string; score: number }[]>(
    sql,
    ...params,
  );
  return rows.map((row) => ({ id: row.id, score: Number(row.score) }));
}
