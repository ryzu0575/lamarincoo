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

/** Pembungkus route: rate limit + penanganan error seragam. */
export async function handle(req: Request, fn: () => Promise<unknown>) {
  if (!rateLimit(getIp(req))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi." }, { status: 429 });
  }
  try {
    return NextResponse.json(await fn());
  } catch (e) {
    if (e instanceof AIError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan tak terduga di server." }, { status: 500 });
  }
}
