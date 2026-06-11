import Link from "next/link";
import { Icon } from "./icons";

// Placeholder for secondary destinations reachable from the mobile "Plus"
// sheet, kept until the real screens land so the nav never dead-ends.
export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto w-full max-w-content animate-fade-up px-[18px] py-16 sm:px-8 sm:py-20">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
        Bientôt
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[40px]">
        {title}
      </h1>
      <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-ink-soft">
        {description}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 py-1.5 text-[15px] font-semibold text-ink-soft transition hover:text-accent"
      >
        <Icon name="back" size={18} /> Retour à l&apos;accueil
      </Link>
    </main>
  );
}
