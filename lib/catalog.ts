// Shared catalog constants and helpers for the /parametres editors. This module
// is CLIENT-SAFE (no server-only imports): the same lists/derivations are used
// by the Server Actions (validation) and by the CatalogTable client component
// (selects, "À compléter" status, accent-insensitive search).

/** Grocery aisles ("rayon") offered for an ingredient. Free list, may grow. */
export const AISLES = [
  "Légume",
  "Fruit",
  "Viande",
  "Poisson",
  "Produit laitier",
  "Épicerie",
  "Épice",
  "Herbe",
  "Boisson",
] as const;

/** Unit families offered for a unit. */
export const UNIT_KINDS = [
  "Masse",
  "Volume",
  "Quantité",
  "Cuillère/pincée",
] as const;

export type Aisle = (typeof AISLES)[number];
export type UnitKind = (typeof UNIT_KINDS)[number];

/** Which catalog a CatalogTable edits. */
export type CatalogKind = "ingredient" | "utensil" | "unit";

// Row shapes sent from the server pages to the CatalogTable. `uses` is the
// number of recipes referencing the entry; `image` is the custom override URL.
export type IngredientRow = {
  id: string;
  name: string;
  aisle: string | null;
  defaultUnitId: string | null;
  image: string | null;
  uses: number;
};

export type UtensilRow = {
  id: string;
  name: string;
  image: string | null;
  uses: number;
};

export type UnitRow = {
  id: string;
  name: string;
  abbreviation: string | null;
  kind: string | null;
  uses: number;
};

/** Accent- and case-insensitive normalization for search/compare. */
export function norm(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/** An ingredient is incomplete when it lacks an aisle or a default unit. */
export function ingredientIncomplete(r: {
  aisle: string | null;
  defaultUnitId: string | null;
}): boolean {
  return !r.aisle || !r.defaultUnitId;
}

/** A unit is incomplete when it lacks an abbreviation or a kind. */
export function unitIncomplete(r: {
  abbreviation: string | null;
  kind: string | null;
}): boolean {
  return !r.abbreviation || !r.kind;
}