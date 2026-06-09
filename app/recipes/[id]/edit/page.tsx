

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { asLines, withFlatTags } from "@/lib/recipes";
import { updateRecipeAction } from "../../actions";
import { RecipeForm } from "../../recipe-form";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Modifier la recette" };

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const row = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { position: "asc" } },
      recipeTags: { include: { tag: true }, orderBy: { tag: { name: "asc" } } },
    },
  });

  if (!row) {
    notFound();
  }

  const recipe = withFlatTags(row);

  // updateRecipeAction(id, prevState, formData) → on fige l'id via bind.
  const action = updateRecipeAction.bind(null, recipe.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link href={`/recipes/${recipe.id}`} className="text-sm text-zinc-500 hover:underline">
        ← Retour à la recette
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-semibold">Modifier la recette</h1>
      <RecipeForm
        action={action}
        submitLabel="Enregistrer"
        defaultValues={{
          title: recipe.title,
          description: recipe.description ?? "",
          servings: recipe.servings?.toString() ?? "",
          prepTime: recipe.prepTime?.toString() ?? "",
          cookTime: recipe.cookTime?.toString() ?? "",
          ingredients: recipe.ingredients.map((i) => i.name).join("\n"),
          steps: asLines(recipe.steps).join("\n"),
          tags: recipe.tags.map((t) => t.name).join(", "),
        }}
      />
    </main>
  );
}