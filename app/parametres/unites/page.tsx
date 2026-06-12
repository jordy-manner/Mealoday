import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { UNIT_KINDS } from "@/lib/catalog";
import { CatalogTable, type CatalogRow, type Column } from "../_catalog-table";

export const metadata: Metadata = { title: "Unités" };
export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const units = await prisma.unit.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      abbreviation: true,
      kind: true,
      _count: { select: { recipeIngredients: true } },
    },
  });

  const rows: CatalogRow[] = units.map((u) => ({
    id: u.id,
    name: u.name,
    abbreviation: u.abbreviation,
    kind: u.kind,
    uses: u._count.recipeIngredients,
  }));

  const columns: Column[] = [
    {
      key: "name",
      label: "Nom",
      type: "text",
      strong: true,
      width: "minmax(150px,1.4fr)",
      placeholder: "ex. Gramme",
    },
    {
      key: "abbreviation",
      label: "Abréviation",
      type: "text",
      width: "minmax(110px,0.8fr)",
      placeholder: "ex. g",
    },
    {
      key: "kind",
      label: "Type",
      type: "select",
      options: UNIT_KINDS.map((k) => ({ value: k, label: k })),
      width: "minmax(150px,1fr)",
    },
  ];

  return (
    <CatalogTable
      title="Unités"
      subtitle="Les unités de mesure disponibles pour les quantités."
      addLabel="Ajouter une unité"
      catalogKind="unit"
      hasImage={false}
      columns={columns}
      initialRows={rows}
      requiredKeys={["abbreviation", "kind"]}
    />
  );
}
