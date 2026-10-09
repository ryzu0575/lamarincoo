import { NextResponse } from "next/server";
import { AIError } from "./gemini";

const hits = new Map<string, number[]>();

/** Rate limit sederhana in-memory per IP (ganti dengan Redis/Upstash untuk produksi multi-instance). */
export function rateLimit(ip: string, limit = 12, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) return false;
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}

export function getIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

export async function handle(req: Request, fn: () => Promise<unknown>) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi." }, { status: 429 });
  }
  try {
    return NextResponse.json(await fn());
  } catch (e: unknown) {
    if (e instanceof AIError || (e && typeof e === "object" && "status" in e && "message" in e)) {
      const err = e as { message: string; status?: number };
      return NextResponse.json({ error: err.message }, { status: err.status || 500 });
    }
    console.error("API error:", e);
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan tak terduga di server.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
