import type { Metadata } from "next";
import { getSeasonFrequency, getSetting, SETTING_KEYS } from "@/lib/settings";
import { getSeasonStats, SEASON_SOURCES } from "@/lib/season-sources";
import { SeasonData } from "../_season-data";

export const metadata: Metadata = { title: "Données de saison" };
export const dynamic = "force-dynamic";

export default async function SeasonSettingsPage() {
  const [stats, frequency, lastChecked] = await Promise.all([
    getSeasonStats(),
    getSeasonFrequency(),
    getSetting(SETTING_KEYS.seasonLastChecked),
  ]);

  return (
    <section className="animate-fade-up">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-ink">Données de saison</h1>
        <p className="mt-0.5 text-sm text-ink-soft">
          Le calendrier des fruits &amp; légumes, synchronisé depuis les sources publiques
          référencées dans le code.
        </p>
      </header>
      <SeasonData
        stats={stats}
        sources={SEASON_SOURCES}
        frequency={frequency}
        lastChecked={lastChecked}
      />
    </section>
  );
}
