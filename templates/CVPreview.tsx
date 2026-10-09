"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { CVData, SectionKey } from "@/lib/types";
import { contactParts, dateRange, hasPhoto, orderedSections, sectionTitle } from "@/lib/cvFormat";

const FONT = "Arial, Helvetica, sans-serif";

/** Preview HTML satu kolom, urutan baca linear. Teks asli (bukan gambar). */
export function CVPreview({ cv }: { cv: CVData }) {
  const { settings: s, personal: p } = cv;
  const tpl = s.template;
  const accent = tpl === "ats" ? "#111111" : s.accent;
  const gap = 10 * s.spacing;
  const photo = hasPhoto(cv);
  const body: CSSProperties = { fontFamily: FONT, fontSize: `${s.fontSize}pt`, lineHeight: 1.4, color: "#111" };

  const heading = (k: SectionKey) => (
    <h2
      style={{
        fontSize: "1.05em",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: tpl === "ats" ? "#111" : accent,
        borderBottom: `${tpl === "ats" ? 1 : 2}px solid ${accent}`,
        paddingBottom: 2,
        marginBottom: 6,
        marginTop: gap * 1.4,
      }}
    >
      {sectionTitle(k)}
    </h2>
  );

  const row = (left: React.ReactNode, right?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ fontWeight: 700 }}>{left}</div>
      {right && <div style={{ whiteSpace: "nowrap", fontSize: "0.92em" }}>{right}</div>}
    </div>
  );

  const bullets = (b: string[]) =>
    b.filter(Boolean).length > 0 && (
      <ul style={{ margin: "3px 0 0 18px", listStyle: "disc" }}>
        {b.filter(Boolean).map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    );

  const renderSection = (k: SectionKey) => {
    switch (k) {
      case "summary":
        return <p>{cv.summary}</p>;
      case "experience":
        return cv.experience.map((e) => (
          <div key={e.id} style={{ marginBottom: gap }}>
            {row(e.role, dateRange(e.start, e.end))}
            <div style={{ fontStyle: "italic" }}>{[e.company, e.location].filter(Boolean).join(", ")}</div>
            {bullets(e.bullets)}
          </div>
        ));
      case "education":
        return cv.education.map((e) => (
          <div key={e.id} style={{ marginBottom: gap }}>
            {row(e.school, dateRange(e.start, e.end))}
            <div>{[e.degree, e.gpa && `IPK ${e.gpa}`].filter(Boolean).join(" · ")}</div>
            {e.notes && <div style={{ fontSize: "0.95em" }}>{e.notes}</div>}
          </div>
        ));
      case "skills":
        return (
          <div>
            {cv.skills.technical.length > 0 && (
              <p>
                <b>Teknis:</b> {cv.skills.technical.join(", ")}
              </p>
            )}
            {cv.skills.soft.length > 0 && (
              <p>
                <b>Non-teknis:</b> {cv.skills.soft.join(", ")}
              </p>
            )}
          </div>
        );
      case "projects":
        return cv.projects.map((x) => (
          <div key={x.id} style={{ marginBottom: gap }}>
            {row(x.name, x.link)}
            {x.description && <div>{x.description}</div>}
            {bullets(x.bullets)}
          </div>
        ));
      case "certifications":
        return cv.certifications.map((x) => (
          <div key={x.id}>{row([x.name, x.issuer].filter(Boolean).join(" — "), x.year)}</div>
        ));
      case "organizations":
        return cv.organizations.map((x) => (
          <div key={x.id} style={{ marginBottom: gap }}>
            {row([x.name, x.role].filter(Boolean).join(" — "), dateRange(x.start, x.end))}
            {x.description && <div>{x.description}</div>}
          </div>
        ));
      case "awards":
        return cv.awards.map((x) => <div key={x.id}>{row([x.name, x.issuer].filter(Boolean).join(" — "), x.year)}</div>);
      case "languages":
        return <p>{cv.languages.map((l) => [l.name, l.level && `(${l.level})`].filter(Boolean).join(" ")).join(", ")}</p>;
    }
  };

  return (
    <div className="cv-page" style={{ ...body, padding: "48px 52px", background: "#fff", minHeight: "100%" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          textAlign: tpl === "modern" || photo ? "left" : "center",
          borderTop: tpl === "modern" ? `6px solid ${accent}` : undefined,
          paddingTop: tpl === "modern" ? 14 : 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.9em", fontWeight: 800, color: tpl === "ats" ? "#111" : accent, lineHeight: 1.15 }}>
            {p.name || "Nama Lengkap"}
          </h1>
          {p.title && <div style={{ fontSize: "1.1em", marginTop: 2 }}>{p.title}</div>}
          <div style={{ marginTop: 4, fontSize: "0.92em" }}>{contactParts(cv).join("  |  ")}</div>
        </div>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt="Foto profil" style={{ width: 92, height: 92, objectFit: "cover", borderRadius: tpl === "fresh" ? 8 : 999 }} />
        )}
      </header>
      {orderedSections(cv).map((k) => (
        <section key={k}>
          {heading(k)}
          {renderSection(k)}
        </section>
      ))}
    </div>
  );
}

const PAGE = { A4: { w: 794, h: 1123 }, Letter: { w: 816, h: 1056 } };

/** Menskalakan halaman kertas agar muat dalam lebar kontainer. */
export function FitPage({ paper, children }: { paper: "A4" | "Letter"; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const dim = PAGE[paper];
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / dim.w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [dim.w]);
  return (
    <div ref={ref} className="w-full">
      <div style={{ height: dim.h * scale }} className="overflow-hidden rounded-2xl shadow-lg">
        <div style={{ width: dim.w, minHeight: dim.h, transform: `scale(${scale})`, transformOrigin: "top left", background: "#fff" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
