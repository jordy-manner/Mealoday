"use server";

// Server Actions for the preference sections of /parametres: the Pexels API key
// (a server secret — never returned to the client), the seasonal-data check
// frequency, and the "Vérifier les sources" job. Theme/accent are not here:
// they are a client preference (localStorage).

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  SETTING_KEYS,
  SEASON_FREQUENCIES,
  setSetting,
} from "@/lib/settings";
import { getSeasonStats, type SeasonStats } from "@/lib/season-sources";

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

/** Saves the Pexels API key as a server secret. The value is never read back. */
export async function savePexelsKey(rawKey: string): Promise<ActionResult> {
  const key = z.string().trim().min(1, "Clé vide").safeParse(rawKey);
  if (!key.success) return { ok: false, error: key.error.issues[0].message };
  // A masked placeholder (only bullet characters) must not overwrite the key.
  if (/^[•*\s]+$/.test(key.data)) return { ok: false, error: "Saisissez une nouvelle clé" };
  await setSetting(SETTING_KEYS.pexelsApiKey, key.data);
  revalidatePath("/parametres/general");
  revalidatePath("/saisons");
  return { ok: true };
}

/** Sets the seasonal-data auto-check frequency. */
export async function setSeasonFrequency(value: string): Promise<ActionResult> {
  const parsed = z.enum(SEASON_FREQUENCIES).safeParse(value);
  if (!parsed.success) return { ok: false, error: "Fréquence invalide" };
  await setSetting(SETTING_KEYS.seasonCheckFrequency, parsed.data);
  revalidatePath("/parametres/saisons");
  return { ok: true };
}

/**
 * "Vérifier les sources": recomputes the dataset stats from the DB and stamps
 * the last-check date. (No live scraping yet — this confirms the committed
 * dataset and records that a check ran; a real source diff will come later.)
 */
export async function checkSeasonSources(): Promise<
  ActionResult<{ lastChecked: string; stats: SeasonStats }>
> {
  const stats = await getSeasonStats();
  const now = new Date().toISOString();
  await setSetting(SETTING_KEYS.seasonLastChecked, now);
  revalidatePath("/parametres/saisons");
  return { ok: true, lastChecked: now, stats };
}
