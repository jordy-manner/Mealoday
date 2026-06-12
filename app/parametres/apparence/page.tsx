import type { Metadata } from "next";
import { ApparenceControls } from "../_apparence-controls";

export const metadata: Metadata = { title: "Apparence" };

export default function ApparencePage() {
  return (
    <section className="animate-fade-up">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-ink">Apparence</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Personnalisez le thème et la couleur d’accent de l’interface.
        </p>
      </header>
      <ApparenceControls />
    </section>
  );
}
