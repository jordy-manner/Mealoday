// Server-side settings store (Setting key/value table). Secrets such as the
// Pexels API key live here, read server-side only and NEVER returned to the
// client. Theme/accent are a client preference (localStorage), not stored here.
//
// Server-only: imports lib/prisma. Do not import from client components.

import { prisma } from "@/lib/prisma";

export const SETTING_KEYS = {
  pexelsApiKey: "pexels_api_key",
  seasonCheckFrequency: "season_check_frequency",
  seasonLastChecked: "season_last_checked",
} as const;

/** Seasonal-data automatic check frequency. */
export const SEASON_FREQUENCIES = ["Manuelle", "Hebdomadaire", "Mensuelle"] as const;
export type SeasonFrequency = (typeof SEASON_FREQUENCIES)[number];

/** Reads a single setting value, or null when unset. */
export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/** Upserts a setting value. */
export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/**
 * The effective Pexels API key: the DB setting takes precedence over the
 * PEXELS_API_KEY environment variable (the deployment fallback). Server-only.
 */
export async function getPexelsKey(): Promise<string | null> {
  const stored = await getSetting(SETTING_KEYS.pexelsApiKey);
  return stored?.trim() || process.env.PEXELS_API_KEY?.trim() || null;
}

/** Whether a Pexels key is configured (DB or env), without exposing its value. */
export async function pexelsConfigured(): Promise<boolean> {
  return (await getPexelsKey()) !== null;
}

/** Current seasonal-check frequency (defaults to "Mensuelle"). */
export async function getSeasonFrequency(): Promise<SeasonFrequency> {
  const v = await getSetting(SETTING_KEYS.seasonCheckFrequency);
  return (SEASON_FREQUENCIES as readonly string[]).includes(v ?? "")
    ? (v as SeasonFrequency)
    : "Mensuelle";
}