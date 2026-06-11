"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "../components/icons";

const TIME_OPTIONS = [
  { v: 0, l: "Tous" },
  { v: 30, l: "≤ 30 min" },
  { v: 60, l: "≤ 1 h" },
];
const DIFF_OPTIONS = [
  { v: 0, l: "Toutes" },
  { v: 1, l: "Facile" },
  { v: 2, l: "Moyen" },
  { v: 3, l: "Difficile" },
];

/**
 * Search/filter controls. They only read/write the URL (`/recettes?…`); the
 * actual filtering + results rendering happen server-side (page.tsx).
 */
export function SearchControls({ categories }: { categories: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const q = sp.get("q") ?? "";
  const byIngredient = sp.get("ing") === "1";
  const cat = sp.get("cat");
  const maxTime = Number(sp.get("t") ?? "0");
  const diff = Number(sp.get("d") ?? "0");
  const active = q.trim() !== "" || cat !== null || maxTime > 0 || diff > 0;

  const [text, setText] = useState(q);

  /** Builds the next URL from the current params with `changes` applied. */
  function push(changes: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `/recettes?${qs}` : "/recettes");
  }

  return (
    <>
      {/* Search block */}
      <div className="flex max-w-content flex-col gap-3.5" style={{ maxWidth: 720 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: text.trim() });
          }}
          className="flex items-center gap-3 rounded-full border border-line bg-surface py-2 pl-[22px] pr-2 text-ink-faint shadow-card-lg transition focus-within:border-accent focus-within:shadow-[var(--shadow-card-lg),0_0_0_4px_var(--color-accent-soft)]"
        >
          <Icon name={byIngredient ? "leaf" : "search"} size={20} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              byIngredient
                ? "tomate, pois chiches, citron…"
                : "Rechercher une recette, un ingrédient…"
            }
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[17px] text-ink outline-none placeholder:text-ink-faint"
          />
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                push({ q: null });
              }}
              aria-label="Effacer la recherche"
              className="grid h-[30px] w-[30px] place-items-center rounded-full bg-surface-muted text-ink-soft transition hover:bg-line"
            >
              <Icon name="x" size={16} />
            </button>
          )}
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-accent-deep active:translate-y-px"
          >
            Chercher
          </button>
        </form>

        <button
          type="button"
          onClick={() => push({ ing: byIngredient ? null : "1" })}
          aria-pressed={byIngredient}
          className={`inline-flex items-center gap-2.5 self-start whitespace-nowrap rounded-full border px-[15px] py-2 text-[13.5px] font-semibold transition ${
            byIngredient
              ? "border-transparent bg-veg-soft text-veg"
              : "border-line text-ink-soft hover:border-ink-faint"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full transition ${byIngredient ? "bg-veg" : "bg-line"}`}
          />
          Chercher par ingrédients que j&apos;ai
        </button>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mt-[26px] flex flex-wrap gap-2.5">
          {categories.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => push({ cat: on ? null : c })}
                aria-pressed={on}
                className={`whitespace-nowrap rounded-full border px-[18px] py-2.5 text-[14px] font-semibold transition ${
                  on
                    ? "border-ink bg-ink text-bg"
                    : "border-line bg-surface text-ink-soft hover:border-ink-faint hover:text-ink"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      {/* Filter bar */}
      {active && (
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-card border border-line-soft bg-surface px-5 py-3.5 shadow-card">
          <span className="inline-flex items-center gap-2 text-[14px] font-bold">
            <Icon name="filter" size={16} /> Filtres
          </span>
          <FilterGroup
            label="Temps"
            options={TIME_OPTIONS}
            value={maxTime}
            onChange={(v) => push({ t: v ? String(v) : null })}
          />
          <FilterGroup
            label="Difficulté"
            options={DIFF_OPTIONS}
            value={diff}
            onChange={(v) => push({ d: v ? String(v) : null })}
          />
        </div>
      )}
    </>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: number; l: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-0.5 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={on}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
              on
                ? "border-transparent bg-accent-soft text-accent-ink"
                : "border-line text-ink-soft hover:border-ink-faint"
            }`}
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
