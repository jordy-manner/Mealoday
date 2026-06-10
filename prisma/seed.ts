import { config } from "dotenv";
// Charge .env.local (secrets) puis .env, comme prisma.config.ts.
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Catalogue d'unités courantes proposées en autocomplete dès le départ.
const UNITS = [
  "g",
  "kg",
  "ml",
  "cl",
  "l",
  "pincée",
  "cuillère à café",
  "cuillère à soupe",
  "unité",
  "tranche",
  "gousse",
  "sachet",
];

// Déclinaison « <base> <taille> cm » pour les ustensiles dont le diamètre compte
// (plats, casseroles, poêles, crêpières, moules…).
const sizes = (base: string, diametres: number[]) =>
  diametres.map((d) => `${base} ${d} cm`);

// Catalogue d'ustensiles de cuisine de base. Les contenants/feux dont la taille
// importe sont déclinés par diamètre — à ajuster au besoin.
const UTENSILS = [
  // Petits ustensiles de base
  "Cuillère en bois",
  "Fouet",
  "Spatule",
  "Maryse",
  "Louche",
  "Écumoire",
  "Couteau de chef",
  "Couteau d'office",
  "Économe",
  "Planche à découper",
  "Râpe",
  "Mandoline",
  "Passoire",
  "Chinois",
  "Saladier",
  "Cul-de-poule",
  "Balance de cuisine",
  "Verre doseur",
  "Rouleau à pâtisserie",
  "Pinceau de cuisine",
  "Presse-ail",
  "Presse-agrumes",
  "Minuteur",
  "Thermomètre de cuisine",
  "Robot pâtissier",
  "Batteur électrique",
  "Mixeur plongeant",
  "Blender",
  "Grille de refroidissement",
  "Emporte-pièce",
  // Moules (déclinés par diamètre)
  ...sizes("Moule à manqué", [18, 20, 22, 24, 26, 28]),
  ...sizes("Moule à tarte", [24, 26, 28]),
  ...sizes("Moule à cake", [24, 26, 30]),
  ...sizes("Cercle à pâtisserie", [16, 18, 20, 24]),
  "Moule à charlotte",
  "Moule à savarin",
  "Moule à muffins",
  // Contenants / feux (déclinés par diamètre)
  ...sizes("Casserole", [14, 16, 18, 20, 24]),
  ...sizes("Poêle", [20, 24, 26, 28, 30]),
  ...sizes("Crêpière", [24, 26, 28, 30]),
  ...sizes("Sauteuse", [24, 28]),
  ...sizes("Faitout", [20, 24]),
  ...sizes("Cocotte en fonte", [24, 28]),
  ...sizes("Plat à gratin", [20, 25, 30, 35]),
  "Wok",
  "Marmite",
];

async function main() {
  for (const name of UNITS) {
    await prisma.unit.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of UTENSILS) {
    await prisma.utensil.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(
    `Seed terminé : ${UNITS.length} unités et ${UTENSILS.length} ustensiles garantis.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
