import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ingredientsCreate,
  recipeScalars,
  recipeTagsCreate,
  validateRecipeInput,
  withFlatTags,
} from "@/lib/recipes";

// Inclut les relations : ingrédients ordonnés, tags via la jonction RecipeTag.
const withRelations = {
  ingredients: { orderBy: { position: "asc" } },
  recipeTags: { include: { tag: true }, orderBy: { tag: { name: "asc" } } },
} as const;

// GET /api/recipes — liste des recettes (plus récentes d'abord)
export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: withRelations,
  });
  return NextResponse.json(recipes.map(withFlatTags));
}

// POST /api/recipes — création
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  const result = validateRecipeInput(body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      ...recipeScalars(result.data),
      ingredients: { create: ingredientsCreate(result.data) },
      recipeTags: { create: recipeTagsCreate(result.data) },
    },
    include: withRelations,
  });
  return NextResponse.json(withFlatTags(recipe), { status: 201 });
}
