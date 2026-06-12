import { NextResponse } from "next/server";
import { getSeasonFrequency, getSetting, SETTING_KEYS } from "@/lib/settings";
import { runSeasonUpdate } from "@/lib/season-update";

// Scheduled seasonal-data update. A single daily Vercel Cron (vercel.json) hits
// this route; the route itself gates on the user-chosen frequency (stored in
// Setting) + the last-check date, so the cadence is configurable at runtime
// (Manuelle → never, Hebdomadaire → ≥ 7 days, Mensuelle → ≥ 28 days).
//
// Protected by CRON_SECRET: Vercel Cron sends "Authorization: Bearer
// $CRON_SECRET" when that env var is set. Until it's configured the endpoint is
// a safe no-op (401).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DUE_DAYS: Record<string, number> = { Hebdomadaire: 7, Mensuelle: 28 };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [frequency, lastChecked] = await Promise.all([
    getSeasonFrequency(),
    getSetting(SETTING_KEYS.seasonLastChecked),
  ]);

  const threshold = DUE_DAYS[frequency]; // undefined for "Manuelle"
  if (threshold === undefined) {
    return NextResponse.json({ ran: false, reason: "frequency manuelle", frequency });
  }

  const days = lastChecked ? (Date.now() - Date.parse(lastChecked)) / 86_400_000 : Infinity;
  if (days < threshold) {
    return NextResponse.json({
      ran: false,
      reason: "not due yet",
      frequency,
      days: Math.round(days),
    });
  }

  const result = await runSeasonUpdate({ refreshCarbon: true });
  return NextResponse.json({ ran: true, frequency, result });
}
