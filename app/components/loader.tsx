import { Icon } from "./icons";

// Page-transition loader: a large logo "bubble" with a pulsing halo + a small
// "ça mijote…" caption. Server-safe (no hooks) — rendered by route loading.tsx
// files as the Suspense fallback during navigation.
export function Loader() {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className="flex min-h-[65vh] animate-fade-in flex-col items-center justify-center gap-6 px-6"
    >
      <div className="relative grid place-items-center">
        {/* Pulsing halos behind the bubble (sonar effect). */}
        <span
          aria-hidden="true"
          className="animate-halo absolute h-28 w-28 rounded-full bg-accent-soft"
        />
        <span
          aria-hidden="true"
          className="animate-halo absolute h-28 w-28 rounded-full bg-accent/20 [animation-delay:0.85s]"
        />
        {/* The logo bubble. */}
        <span className="animate-breathe relative grid h-28 w-28 place-items-center rounded-full bg-accent text-white shadow-card-lg">
          <Icon name="chef" size={56} strokeWidth={1.6} />
        </span>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <span className="font-display text-[26px] font-semibold tracking-[-0.01em]">
          Marmite<span className="text-accent">.</span>
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
          Ça mijote
          <span className="flex items-end gap-1">
            <span className="animate-dot h-[5px] w-[5px] rounded-full bg-accent" />
            <span className="animate-dot h-[5px] w-[5px] rounded-full bg-accent [animation-delay:0.15s]" />
            <span className="animate-dot h-[5px] w-[5px] rounded-full bg-accent [animation-delay:0.3s]" />
          </span>
        </span>
      </div>
    </div>
  );
}
