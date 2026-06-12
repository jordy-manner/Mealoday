import type { Metadata } from "next";
import { Icon } from "../../components/icons";
import { pexelsConfigured } from "@/lib/settings";
import { PexelsKeyForm } from "../_general-form";

export const metadata: Metadata = { title: "Général" };
export const dynamic = "force-dynamic";

export default async function GeneralPage() {
  const configured = await pexelsConfigured();

  return (
    <section className="animate-fade-up">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-ink">Général</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Clés d’API et réglages globaux de l’application.
        </p>
      </header>

      <div className="space-y-4">
        <PexelsKeyForm configured={configured} />

        {/* Placeholder: AI assistant key — coming later. */}
        <div className="rounded-card border border-line bg-surface p-5 opacity-70 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-surface-muted text-ink-faint">
                <Icon name="sparkle" size={18} />
              </span>
              <div>
                <b className="text-sm text-ink">Clé API — Assistant IA</b>
                <p className="text-sm text-ink-soft">
                  Suggestions de recettes et génération d’étapes.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-faint">
              À venir
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              disabled
              placeholder="sk-•••• — bientôt disponible"
              aria-label="Clé API Assistant IA (à venir)"
              className="flex-1 rounded-input border border-line bg-surface-muted px-3 py-2 font-mono text-sm text-ink-faint"
            />
            <button
              disabled
              className="rounded-input border border-line px-4 py-2 text-sm text-ink-faint"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
