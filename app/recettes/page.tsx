import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSearchActive, searchRecipeIds, type SearchParams } from "@/lib/search";
import { Icon } from "../components/icons";
import { RecipeCard, type RecipeCardData } from "../components/recipe-card";
import { SearchControls } from "./search-controls";

export const metadata = { title: "Recettes" };

// DB-dependent data → rendered on demand (no static prerender at build time).
export const dynamic = "force-dynamic";

const cardInclude = {
  recipeTags: { include: { tag: true }, orderBy: { tag: { name: "asc" } } },
  recipeCategories: { include: { category: true }, orderBy: { position: "asc" } },
} as const;

type CardRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: number | null;
  rating: number | null;
  imageUrl: string | null;
  popular: boolean;
  recipeTags: { tag: { name: string } }[];
  recipeCategories: { category: { name: string } }[];
};

function toCard(r: CardRow): RecipeCardData {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    servings: r.servings,
    difficulty: r.difficulty,
    rating: r.rating,
    imageUrl: r.imageUrl,
    tags: r.recipeTags.map((rt) => rt.tag.name),
    categories: r.recipeCategories.map((rc) => rc.category.name),
  };
}

/** Magazine layout: first card is a full-width feature, rest in a 2-col grid. */
function MagazineGrid({
  recipes,
  matches,
}: {
  recipes: RecipeCardData[];
  matches?: Map<string, { count: number; total: number }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-[26px] md:grid-cols-2">
      {recipes.map((r, i) => (
        <RecipeCard key={r.id} r={r} big={i === 0} match={matches?.get(r.id)} />
      ))}
    </div>
  );
}

function SectionHead({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-[22px] flex items-end justify-between gap-5">
      <h2 className="inline-flex items-center gap-2.5 font-display text-[28px] font-medium tracking-[-0.015em]">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params: SearchParams = {
    q: str(sp.q),
    byIngredient: str(sp.ing) === "1",
    category: str(sp.cat) || null,
    maxTime: Number(str(sp.t)) || 0,
    difficulty: Number(str(sp.d)) || 0,
  };
  const active = isSearchActive(params);

  const [categories, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.recipe.count(),
  ]);

  let resultsView: React.ReactNode;

  if (active) {
    const hits = await searchRecipeIds(params);
    const rows = hits.length
      ? ((await prisma.recipe.findMany({
          where: { id: { in: hits.map((h) => h.id) } },
          include: cardInclude,
        })) as unknown as CardRow[])
      : [];
    const byId = new Map(rows.map((r) => [r.id, toCard(r)]));
    const results = hits.map((h) => byId.get(h.id)).filter(Boolean) as RecipeCardData[];

    const termCount = params.q.split(",").map((t) => t.trim()).filter(Boolean).length;
    const matches =
      params.byIngredient && params.q.trim()
        ? new Map(hits.map((h) => [h.id, { count: h.score, total: termCount }]))
        : undefined;

    resultsView = (
      <section>
        <SectionHead
          title={`${results.length} recette${results.length > 1 ? "s" : ""}`}
          action={
            <Link
              href="/recettes"
              className="inline-flex items-center gap-1 text-[14px] font-bold text-accent-ink transition hover:text-accent"
            >
              Réinitialiser
            </Link>
          }
        />
        {results.length > 0 ? (
          <MagazineGrid recipes={results} matches={matches} />
        ) : (
          <p className="rounded-card border border-dashed border-line px-4 py-12 text-center text-ink-soft">
            Aucune recette ne correspond à votre recherche.
          </p>
        )}
      </section>
    );
  } else {
    const rows = (await prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: cardInclude,
    })) as unknown as CardRow[];
    const all = rows.map(toCard);
    const popular = rows.filter((r) => r.popular).map(toCard);

    resultsView =
      rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-12">
          {popular.length > 0 && (
            <section>
              <SectionHead
                icon={<Icon name="flame" size={24} className="text-accent" />}
                title="Populaires cette semaine"
              />
              <MagazineGrid recipes={popular} />
            </section>
          )}
          <section>
            <SectionHead title="Toutes les recettes" />
            <MagazineGrid recipes={all} />
          </section>
        </div>
      );
  }

  return (
    <main className="mx-auto w-full max-w-content animate-fade-up px-[18px] sm:px-8">
      {/* Hero */}
      <section className="pb-7 pt-14">
        <p className="eyebrow">
          Cuisine maison · {total} recette{total > 1 ? "s" : ""}
        </p>
        <h1 className="mb-[22px] mt-3 font-display text-[clamp(44px,6vw,76px)] font-medium leading-[0.98] tracking-[-0.025em]">
          Qu&apos;est-ce qu&apos;on
          <br />
          <em className="italic text-accent">cuisine</em> aujourd&apos;hui&nbsp;?
        </h1>
        <p className="mb-8 max-w-[540px] text-[18px] leading-relaxed text-ink-soft">
          Trouvez l&apos;inspiration parmi vos recettes, ou cherchez avec les ingrédients
          que vous avez déjà sous la main.
        </p>
        <SearchControls categories={categories.map((c) => c.name)} />
      </section>

      <div className="pb-4 pt-7">{resultsView}</div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-6 py-16 text-center">
      <p className="font-display text-2xl font-medium">Aucune recette pour l&apos;instant</p>
      <p className="mt-2 text-ink-soft">Lancez-vous et créez la première !</p>
      <Link
        href="/recettes/nouvelle"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-deep"
      >
        <Icon name="plus" size={17} /> Créer une recette
      </Link>
    </div>
  );
}
