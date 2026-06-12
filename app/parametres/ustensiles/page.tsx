import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CatalogTable, type CatalogRow, type Column } from "../_catalog-table";

export const metadata: Metadata = { title: "Ustensiles" };
export const dynamic = "force-dynamic";

export default async function UtensilsPage() {
  const utensils = await prisma.utensil.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      image: true,
      _count: { select: { recipeUtensils: true } },
    },
  });

  const rows: CatalogRow[] = utensils.map((u) => ({
    id: u.id,
    name: u.name,
    image: u.image,
    uses: u._count.recipeUtensils,
  }));

  const columns: Column[] = [
    {
      key: "name",
      label: "Nom",
      type: "text",
      strong: true,
      width: "minmax(240px,2fr)",
      placeholder: "Nom de l'ustensile",
    },
  ];

  return (
    <CatalogTable
      title="Ustensiles"
      subtitle="Le matériel proposé lors de la création d'une recette."
      addLabel="Ajouter un ustensile"
      catalogKind="utensil"
      hasImage
      columns={columns}
      initialRows={rows}
      requiredKeys={[]}
    />
  );
}
