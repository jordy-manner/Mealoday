import type { Metadata } from "next";
import { ComingSoon } from "../components/coming-soon";

export const metadata: Metadata = { title: "Paramètres" };

export default function Page() {
  return (
    <ComingSoon
      title="Paramètres"
      description="Gérez vos catalogues (ingrédients, ustensiles, unités, catégories, tags). Bientôt disponible."
    />
  );
}
