// Seasonal-data sources + stats for the /parametres "Données de saison" view.
// The produce dataset is versioned in lib/data/seasonality.json and seeded into
// the DB (Ingredient season fields). The referenced public sources are listed
// here; "checking" compares the committed dataset and stamps the last-check
// date (lib/settings) — it does not scrape live yet.
//
// Server module (getSeasonStats imports prisma). SEASON_SOURCES is plain data.

import { prisma } from "@/lib/prisma";

export type SeasonSource = {
  name: string;
  detail: string;
  host: string;
  status: "Opérationnelle";
};

export const SEASON_SOURCES: SeasonSource[] = [
  {
    name: "Greenpeace France",
    detail: "Calendrier de saisonnalité",
    host: "greenpeace.fr",
    status: "Opérationnelle",
  },
  {
    name: "Interfel",
    detail: "Les fruits & légumes frais",
    host: "lesfruitsetlegumesfrais.com",
    status: "Opérationnelle",
  },
  {
    name: "Chambres d'agriculture",
    detail: "Herbes aromatiques (plein champ)",
    host: "chambres-agriculture.fr",
    status: "Opérationnelle",
  },
];

export type SeasonStats = {
  produces: number;
  categories: number;
  sources: number;
};

/** Live stats for the seasonal dataset (produce = ingredients with a category). */
export async function getSeasonStats(): Promise<SeasonStats> {
  const grouped = await prisma.ingredient.groupBy({
    by: ["category"],
    where: { category: { not: null } },
    _count: { _all: true },
  });
  const produces = grouped.reduce((sum, g) => sum + g._count._all, 0);
  return {
    produces,
    categories: grouped.length,
    sources: SEASON_SOURCES.length,
  };
}
