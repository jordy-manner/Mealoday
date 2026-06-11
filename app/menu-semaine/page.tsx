import type { Metadata } from "next";
import { ComingSoon } from "../components/coming-soon";

export const metadata: Metadata = { title: "Menu de la semaine" };

export default function Page() {
  return (
    <ComingSoon
      title="Menu de la semaine"
      description="Planifiez vos repas sur la semaine à partir de vos recettes. Bientôt disponible."
    />
  );
}
