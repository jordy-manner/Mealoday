import { NextResponse } from "next/server";
import { pexelsImage } from "@/lib/pexels";

// GET /api/pexels?q=<name> — resolves an auto thumbnail for a catalog entry
// (ingredient/utensil) by name. The API key stays server-side (lib/settings →
// DB or env); the upstream fetch is cached weekly. Returns { url: string|null }
// so the client falls back to the gradient placeholder when no key/no match.
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ url: null });
  const url = await pexelsImage(`${q} fresh food`);
  return NextResponse.json({ url });
}
