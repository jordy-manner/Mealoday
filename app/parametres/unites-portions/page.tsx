import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RefList } from "../_ref-list";
import { createServingUnit, renameServingUnit, deleteServingUnit } from "../ref-actions";

export const metadata: Metadata = { title: "Unités de portion" };
export const dynamic = "force-dynamic";

export default async function ServingUnitsPage() {
  const units = await prisma.servingUnit.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { recipes: true } } },
  });
  const rows = units.map((u) => ({ id: u.id, name: u.name, uses: u._count.recipes }));

  return (
    <RefList
      title="Unités de portion"
      subtitle="Les unités utilisées pour exprimer le rendement d'une recette (personnes, verrines, crêpes…)."
      icon="users"
      addLabel="Ajouter une unité"
      placeholder="ex. verrines"
      usageNoun="recette"
      note="Une unité utilisée par une recette ne peut pas être supprimée — réaffectez d'abord les recettes concernées."
      initialRows={rows}
      create={createServingUnit}
      rename={renameServingUnit}
      remove={deleteServingUnit}
    />
  );
}
