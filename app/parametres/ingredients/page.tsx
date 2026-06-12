import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AISLES } from "@/lib/catalog";
import { CatalogTable, type CatalogRow, type Column } from "../_catalog-table";

export const metadata: Metadata = { title: "Ingrédients" };
export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const [ingredients, units] = await Promise.all([
    prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        aisle: true,
        defaultUnitId: true,
        image: true,
        _count: { select: { recipeIngredients: true } },
      },
    }),
    prisma.unit.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, abbreviation: true },
    }),
  ]);

  const rows: CatalogRow[] = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    aisle: i.aisle,
    defaultUnitId: i.defaultUnitId,
    image: i.image,
    uses: i._count.recipeIngredients,
  }));

  const columns: Column[] = [
    {
      key: "name",
      label: "Nom",
      type: "text",
      strong: true,
      width: "minmax(160px,1.4fr)",
      placeholder: "Nom de l'ingrédient",
    },
    {
      key: "aisle",
      label: "Rayon",
      type: "select",
      options: AISLES.map((a) => ({ value: a, label: a })),
      width: "minmax(130px,1fr)",
    },
    {
      key: "defaultUnitId",
      label: "Unité par défaut",
      type: "select",
      options: units.map((u) => ({
        value: u.id,
        label: u.abbreviation ? `${u.name} (${u.abbreviation})` : u.name,
      })),
      width: "minmax(140px,1fr)",
    },
  ];

  return (
    <CatalogTable
      title="Ingrédients"
      subtitle="Le catalogue partagé par toutes les recettes."
      addLabel="Ajouter un ingrédient"
      catalogKind="ingredient"
      hasImage
      columns={columns}
      initialRows={rows}
      requiredKeys={["aisle", "defaultUnitId"]}
    />
  );
}
