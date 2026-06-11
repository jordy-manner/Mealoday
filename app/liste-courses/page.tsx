import type { Metadata } from "next";
import { ComingSoon } from "../components/coming-soon";

export const metadata: Metadata = { title: "Liste de courses" };

export default function Page() {
  return (
    <ComingSoon
      title="Liste de courses"
      description="Générez votre liste de courses depuis vos recettes et votre menu de la semaine. Bientôt disponible."
    />
  );
}
