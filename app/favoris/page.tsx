import type { Metadata } from "next";
import { ComingSoon } from "../components/coming-soon";

export const metadata: Metadata = { title: "Favoris" };

export default function Page() {
  return (
    <ComingSoon
      title="Favoris"
      description="Retrouvez ici les recettes que vous avez mises de côté. Bientôt disponible."
    />
  );
}
