"use client";

import { useState, useTransition } from "react";
import { Icon } from "../components/icons";
import type { SeasonSource, SeasonStats } from "@/lib/season-sources";
import { checkSeasonSources, setSeasonFrequency } from "./settings-actions";

// Kept in sync with SEASON_FREQUENCIES in lib/settings (server validation). Not
// imported from there to keep Prisma out of the client bundle.
const FREQUENCIES = ["Manuelle", "Hebdomadaire", "Mensuelle"] as const;

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(iso),
      )
    : "jamais";

export function SeasonData({
  stats: initialStats,
  sources,
  frequency: initialFrequency,
  lastChecked: initialLastChecked,
}: {
  stats: SeasonStats;
  sources: SeasonSource[];
  frequency: string;
  lastChecked: string | null;
}) {
  const [stats, setStats] = useState(initialStats);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [lastChecked, setLastChecked] = useState(initialLastChecked);
  const [justChecked, setJustChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  const check = () =>
    startTransition(async () => {
      const res = await checkSeasonSources();
      if (res.ok) {
        setStats(res.stats);
        setLastChecked(res.lastChecked);
        setJustChecked(true);
        setTimeout(() => setJustChecked(false), 2600);
      }
    });

  const onFrequency = (value: string) => {
    setFrequency(value);
    startTransition(async () => {
      await setSeasonFrequency(value);
    });
  };

  return (
    <div className="space-y-4">
      {/* State card */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-input bg-veg-soft text-veg">
              <Icon name="leaf" size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2 font-semibold text-ink">
                <Voyant /> Données à jour
              </div>
              <div className="text-sm text-ink-soft">
                Dernière mise à jour : <b>{fmtDate(lastChecked)}</b> · vérification auto{" "}
                {frequency.toLowerCase()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {justChecked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-veg-soft px-2.5 py-1 text-xs font-semibold text-veg">
                <Icon name="check" size={13} strokeWidth={2.4} /> À jour
              </span>
            )}
            <button
              type="button"
              onClick={check}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-input bg-accent px-3.5 py-2 text-sm font-semibold text-surface transition hover:bg-accent-deep disabled:opacity-60"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                  Vérification…
                </>
              ) : (
                <>
                  <Icon name="refresh" size={16} /> Vérifier les sources
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(stats.produces)} label="produits" />
          <Stat value={String(stats.categories)} label="catégories" />
          <Stat value={String(stats.sources)} label="sources" />
          <Stat value="France" label="métropole" />
        </div>
      </div>

      {/* Sources */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-surface-muted text-accent-ink">
            <Icon name="globe" size={18} />
          </span>
          <div>
            <b className="text-sm text-ink">Sources</b>
            <p className="text-sm text-ink-soft">État des sources de données référencées.</p>
          </div>
        </div>
        <div className="divide-y divide-line-soft rounded-input border border-line-soft">
          {sources.map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-3 py-2.5">
              <Voyant />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                <div className="truncate text-xs text-ink-soft">
                  {s.detail} · <span className="font-mono">{s.host}</span>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-veg">{s.status}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Les données sont versionnées dans le code (
          <span className="font-mono">lib/data/seasonality.json</span>). « Vérifier » contrôle le
          jeu de données committé et actualise la date.
        </p>
      </div>

      {/* Auto-check frequency */}
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-surface-muted text-accent-ink">
              <Icon name="download" size={18} />
            </span>
            <div>
              <b className="text-sm text-ink">Vérification automatique</b>
              <p className="text-sm text-ink-soft">Fréquence à laquelle l’app contrôle les sources.</p>
            </div>
          </div>
          <select
            value={frequency}
            onChange={(e) => onFrequency(e.target.value)}
            aria-label="Fréquence de vérification automatique"
            className="select-chevron w-full rounded-input border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:w-48"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function Voyant() {
  return (
    <span className="relative grid h-2.5 w-2.5 place-items-center">
      <span className="absolute inset-0 rounded-full bg-veg animate-halo" />
      <span className="relative h-2.5 w-2.5 rounded-full bg-veg" />
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-input bg-surface-muted px-3 py-2.5 text-center">
      <div className="font-display text-xl text-ink">{value}</div>
      <div className="text-xs text-ink-soft">{label}</div>
    </div>
  );
}
