"use client";

import { Stagger, StaggerItem } from "./Motion";

export const PRIORITY_STYLE: Record<string, string> = {
  Tinggi: "bg-pink text-pink-s",
  Sedang: "bg-lemon text-lemon-s",
  Rendah: "bg-sky text-sky-s",
};
const ORDER = { Tinggi: 0, Sedang: 1, Rendah: 2 } as Record<string, number>;

export function Section({ title, tone, children, id }: { title: string; tone?: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="card p-6" aria-labelledby={id}>
      <h2 id={id} className={`mb-4 inline-block rounded-full px-4 py-1 font-display text-lg font-bold ${tone ?? "bg-lavender"}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function StrengthList({ items }: { items: string[] }) {
  return (
    <Stagger className="space-y-2">
      {items.map((s, i) => (
        <StaggerItem key={i}>
          <p className="rounded-2xl bg-mint px-4 py-2 text-sm">✅ {s}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export interface IssueLike {
  priority: string;
  title: string;
  quote: string;
  reason: string;
  suggestion: string;
}

export function IssueList({ items }: { items: IssueLike[] }) {
  const sorted = [...items].sort((a, b) => (ORDER[a.priority] ?? 3) - (ORDER[b.priority] ?? 3));
  return (
    <Stagger className="space-y-3">
      {sorted.map((it, i) => (
        <StaggerItem key={i}>
          <article className="rounded-2xl border border-line bg-surface2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${PRIORITY_STYLE[it.priority] ?? "bg-surface2"}`}>{it.priority}</span>
              <h3 className="font-bold">{it.title}</h3>
            </div>
            {it.quote && (
              <blockquote className="mt-2 border-l-4 border-lavender-s pl-3 text-sm italic text-soft">“{it.quote}”</blockquote>
            )}
            <p className="mt-2 text-sm">
              <b>Alasan:</b> {it.reason}
            </p>
            <p className="mt-1 text-sm">
              <b>Saran:</b> {it.suggestion}
            </p>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function RewriteList({ items }: { items: { before: string; after: string; note: string }[] }) {
  return (
    <Stagger className="space-y-3">
      {items.map((r, i) => (
        <StaggerItem key={i}>
          <article className="grid gap-2 rounded-2xl border border-line p-4 md:grid-cols-2">
            <div className="rounded-xl bg-pink p-3 text-sm">
              <p className="text-xs font-bold uppercase text-pink-s">Sebelum</p>
              {r.before}
            </div>
            <div className="rounded-xl bg-mint p-3 text-sm">
              <p className="text-xs font-bold uppercase text-mint-s">Sesudah</p>
              {r.after}
            </div>
            {r.note && <p className="text-xs text-soft md:col-span-2">💡 {r.note}</p>}
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export function Checklist({ items }: { items: { item: string; passed: boolean; note: string }[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((c, i) => (
        <li key={i} className={`rounded-2xl px-4 py-3 text-sm ${c.passed ? "bg-mint" : "bg-pink"}`}>
          <span className="font-bold">
            {c.passed ? "✓" : "✗"} {c.item}
          </span>
          {c.note && <span className="block text-xs text-soft">{c.note}</span>}
        </li>
      ))}
    </ul>
  );
}

export function KeywordChips({ items, tone }: { items: string[]; tone: "mint" | "pink" }) {
  if (!items.length) return <p className="text-sm text-soft">Tidak ada.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k, i) => (
        <span key={i} className={`chip ${tone === "mint" ? "bg-mint text-mint-s" : "bg-pink text-pink-s"}`}>
          {k}
        </span>
      ))}
    </div>
  );
}
