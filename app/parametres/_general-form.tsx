"use client";

import { useState, useTransition } from "react";
import { Icon } from "../components/icons";
import { savePexelsKey } from "./settings-actions";

// The Pexels key is a server secret: it is NEVER sent to the client. The field
// starts empty (a bullet placeholder when a key already exists); saving writes
// a new value server-side. "Connectée" reflects whether a key is configured.
export function PexelsKeyForm({ configured }: { configured: boolean }) {
  const [value, setValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [saved, setSaved] = useState(configured);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await savePexelsKey(value);
      if (res.ok) {
        setSaved(true);
        setValue("");
      } else setError(res.error);
    });
  };

  return (
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-input bg-surface-muted text-accent-ink">
            <Icon name="key" size={18} />
          </span>
          <div>
            <b className="text-sm text-ink">Clé API Pexels</b>
            <p className="text-sm text-ink-soft">
              Photos automatiques des recettes et des produits de saison.
            </p>
          </div>
        </div>
        {saved ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-veg-soft px-2.5 py-1 text-xs font-semibold text-veg">
            <Icon name="check" size={13} strokeWidth={2.4} /> Connectée
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-faint">
            Non configurée
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={configured ? "••••••••••••••••••••" : "Collez votre clé Pexels"}
          aria-label="Clé API Pexels"
          autoComplete="off"
          className="flex-1 rounded-input border border-line bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="rounded-input border border-line px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-muted"
          >
            {reveal ? "Masquer" : "Afficher"}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !value.trim()}
            className="rounded-input bg-accent px-4 py-2 text-sm font-semibold text-surface transition hover:bg-accent-deep disabled:opacity-50"
          >
            {pending ? "…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-accent-deep">{error}</p>}
      <p className="mt-3 text-xs text-ink-faint">
        ⚠ La clé est stockée côté serveur et n’est jamais renvoyée au navigateur.
      </p>
    </div>
  );
}
