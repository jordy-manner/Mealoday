// Seasonal produce dataset (fruits, vegetables, herbs, pulses) for /saisons.
// Committed, Zod-validated, no external runtime API: lib/data/seasonality.json
// (sources: Greenpeace, Interfel, chambres d'agriculture — see its _meta).
// The dataset carries no carbon footprint, so ecv is null for every item.

import { z } from "zod";
import seasonalityJson from "@/lib/data/seasonality.json";
import { hueForSlug, type Produce, type ProduceCategory } from "@/lib/seasons-data";

const ItemSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  category: z.enum(["fruits", "legumes", "herbes", "legumineuses"]),
  months: z.array(z.number().int().min(1).max(12)).min(1),
});

const FileSchema = z.object({ items: z.array(ItemSchema).min(1) });

// Source categories are unaccented; map them to the displayed (accented) ones.
const CATEGORY: Record<z.infer<typeof ItemSchema>["category"], ProduceCategory> = {
  fruits: "fruits",
  legumes: "légumes",
  herbes: "herbes",
  legumineuses: "légumineuses",
};

// Validated at module load: a malformed data file fails fast on the server.
const { items } = FileSchema.parse(seasonalityJson);

/** All seasonal produce, sorted by display name (French collation). */
export const PRODUCE: Produce[] = items
  .map((it): Produce => ({
    name: it.label,
    slug: it.slug,
    months: [...new Set(it.months.filter((m) => m >= 1 && m <= 12))].sort((a, b) => a - b),
    ecv: null,
    category: CATEGORY[it.category],
    hue: hueForSlug(it.slug),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));
