"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CVPreview, FitPage } from "@/templates/CVPreview";
import SortableList from "./builder/SortableList";
import PhotoCropper from "./builder/PhotoCropper";
import AssistButton from "./builder/AssistButton";
import UploadZone from "./UploadZone";
import Confetti from "./Confetti";
import ScoreGauge from "./ScoreGauge";
import { apiPost } from "@/lib/client";
import { atsScore } from "@/lib/atsScore";
import { exportCvDocx, exportCvPdf } from "@/lib/exporters";
import { KEYS, useHydrated, useLocalStorage } from "@/lib/storage";
import { SECTION_TITLES, emptyCV, uid, type CVData, type SectionKey, type TemplateId } from "@/lib/types";
import type { AssistResult } from "@/lib/schemas";

const DEFAULT_CV = emptyCV();

type ListKey = "experience" | "education" | "projects" | "certifications" | "organizations" | "awards" | "languages";
interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  kind?: "area" | "bullets";
  ai?: "experience" | "project" | "organization";
  half?: boolean;
}
interface ListDef {
  label: string;
  addLabel: string;
  fields: FieldDef[];
  title: (i: Record<string, unknown>) => string;
}

const LISTS: Record<ListKey, ListDef> = {
  experience: {
    label: "Pengalaman Kerja",
    addLabel: "+ Tambah pengalaman",
    title: (i) => [i.role, i.company].filter(Boolean).join(" — ") || "Pengalaman baru",
    fields: [
      { key: "role", label: "Posisi", placeholder: "Marketing Executive", half: true },
      { key: "company", label: "Perusahaan", placeholder: "PT Maju Jaya", half: true },
      { key: "location", label: "Lokasi", placeholder: "Jakarta", half: true },
      { key: "start", label: "Mulai", placeholder: "Jan 2022", half: true },
      { key: "end", label: "Selesai", placeholder: "Sekarang", half: true },
      { key: "bullets", label: "Poin pencapaian (satu per baris — bisa catatan kasar)", kind: "bullets", ai: "experience" },
    ],
  },
  education: {
    label: "Pendidikan",
    addLabel: "+ Tambah pendidikan",
    title: (i) => String(i.school || "Pendidikan baru"),
    fields: [
      { key: "school", label: "Institusi", placeholder: "Universitas Indonesia", half: true },
      { key: "degree", label: "Gelar / Jurusan", placeholder: "S1 Manajemen", half: true },
      { key: "start", label: "Mulai", placeholder: "Agu 2018", half: true },
      { key: "end", label: "Selesai", placeholder: "Jul 2022", half: true },
      { key: "gpa", label: "IPK", placeholder: "3.65", half: true },
      { key: "notes", label: "Catatan (opsional)", placeholder: "Cum laude, beasiswa, dll.", kind: "area" },
    ],
  },
  projects: {
    label: "Proyek",
    addLabel: "+ Tambah proyek",
    title: (i) => String(i.name || "Proyek baru"),
    fields: [
      { key: "name", label: "Nama proyek", half: true },
      { key: "link", label: "Tautan", placeholder: "github.com/…", half: true },
      { key: "description", label: "Deskripsi singkat", kind: "area" },
      { key: "bullets", label: "Poin proyek (satu per baris)", kind: "bullets", ai: "project" },
    ],
  },
  certifications: {
    label: "Sertifikasi",
    addLabel: "+ Tambah sertifikasi",
    title: (i) => String(i.name || "Sertifikasi baru"),
    fields: [
      { key: "name", label: "Nama sertifikasi", half: true },
      { key: "issuer", label: "Penerbit", half: true },
      { key: "year", label: "Tahun", half: true },
    ],
  },
  organizations: {
    label: "Organisasi",
    addLabel: "+ Tambah organisasi",
    title: (i) => String(i.name || "Organisasi baru"),
    fields: [
      { key: "name", label: "Organisasi", half: true },
      { key: "role", label: "Jabatan", half: true },
      { key: "start", label: "Mulai", half: true },
      { key: "end", label: "Selesai", half: true },
      { key: "description", label: "Deskripsi", kind: "area", ai: "organization" },
    ],
  },
  awards: {
    label: "Penghargaan",
    addLabel: "+ Tambah penghargaan",
    title: (i) => String(i.name || "Penghargaan baru"),
    fields: [
      { key: "name", label: "Penghargaan", half: true },
      { key: "issuer", label: "Pemberi", half: true },
      { key: "year", label: "Tahun", half: true },
    ],
  },
  languages: {
    label: "Bahasa",
    addLabel: "+ Tambah bahasa",
    title: (i) => String(i.name || "Bahasa baru"),
    fields: [
      { key: "name", label: "Bahasa", placeholder: "Inggris", half: true },
      { key: "level", label: "Tingkat", placeholder: "Aktif / TOEFL 550", half: true },
    ],
  },
};

const STEPS = ["personal", "summary", "experience", "education", "skills", "projects", "certifications", "organizations", "awards", "languages", "design"] as const;
type Step = (typeof STEPS)[number];
const STEP_LABEL: Record<Step, string> = {
  personal: "Data diri",
  summary: "Ringkasan",
  experience: "Pengalaman",
  education: "Pendidikan",
  skills: "Skill",
  projects: "Proyek",
  certifications: "Sertifikasi",
  organizations: "Organisasi",
  awards: "Penghargaan",
  languages: "Bahasa",
  design: "Desain & Ekspor",
};

const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: "ats", name: "ATS Strict", desc: "Satu kolom, tanpa foto. Paling aman untuk ATS." },
  { id: "modern", name: "Modern", desc: "Bersih dengan aksen warna." },
  { id: "photo", name: "Dengan Foto", desc: "Cocok untuk kirim langsung / format Indonesia." },
  { id: "fresh", name: "Fresh Graduate", desc: "Pendidikan & proyek di depan." },
];

const ACCENTS = ["#6b54d6", "#14805a", "#c2571f", "#1f6fb5", "#b8326b", "#8a6a00"];

function F({ id, label, value, onChange, placeholder, type = "text" }: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} type={type} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SkillInput({ id, label, items, onChange }: { id: string; label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(items.join(", "));
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} (pisahkan dengan koma)
      </label>
      <textarea
        id={id}
        className="input min-h-20"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
        }}
      />
    </div>
  );
}

export default function CVBuilder() {
  const hydrated = useHydrated();
  const [cv, setCv] = useLocalStorage<CVData>(KEYS.cv, DEFAULT_CV);
  const [step, setStep] = useState<Step>("personal");
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [crop, setCrop] = useState<File | null>(null);
  const [exporting, setExporting] = useState("");
  const [msg, setMsg] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [rev, setRev] = useState(0);
  const [showImport, setShowImport] = useState(false);

  const set = (fn: (d: CVData) => void) =>
    setCv((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });

  const ats = atsScore(cv);
  const stepIndex = STEPS.indexOf(step);
  const celebrate = () => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3500);
  };

  const doExport = async (type: "pdf" | "docx") => {
    setExporting(type);
    setMsg("");
    try {
      if (type === "pdf") await exportCvPdf(cv);
      else await exportCvDocx(cv);
      celebrate();
    } catch (e) {
      console.error(e);
      setMsg("Gagal mengekspor. Coba lagi.");
    } finally {
      setExporting("");
    }
  };

  const doImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("mode", "import");
      const { cv: imported } = await apiPost<{ cv: CVData }>("/api/improve-cv", fd);
      setCv({ ...imported, settings: cv.settings, personal: { ...imported.personal, photo: cv.personal.photo } });
      setRev((r) => r + 1);
      setShowImport(false);
      setImportFile(null);
      setMsg("Data CV berhasil diimpor ke form.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const renderList = (k: ListKey) => {
    const def = LISTS[k];
    const items = cv[k] as unknown as (Record<string, unknown> & { id: string })[];
    return (
      <div className="space-y-4">
        <SortableList
          items={items}
          onChange={(next) => set((d) => ((d[k] as unknown) = next))}
          label={(i) => def.title(i)}
          render={(item, idx) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {def.fields
                  .filter((f) => f.half)
                  .map((f) => (
                    <F
                      key={f.key}
                      id={`${k}-${item.id}-${f.key}`}
                      label={f.label}
                      placeholder={f.placeholder}
                      value={String(item[f.key] ?? "")}
                      onChange={(v) => set((d) => ((d[k][idx] as unknown as Record<string, unknown>)[f.key] = v))}
                    />
                  ))}
              </div>
              {def.fields
                .filter((f) => !f.half)
                .map((f) => {
                  const id = `${k}-${item.id}-${f.key}`;
                  const isBullets = f.kind === "bullets";
                  const value = isBullets ? ((item[f.key] as string[]) ?? []).join("\n") : String(item[f.key] ?? "");
                  const ctx = [item.role, item.company, item.name].filter(Boolean).join(" di ");
                  return (
                    <div key={f.key}>
                      <label htmlFor={id} className="label">
                        {f.label}
                      </label>
                      <textarea
                        id={id}
                        className="input min-h-24"
                        value={value}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          set((d) => ((d[k][idx] as unknown as Record<string, unknown>)[f.key] = isBullets ? e.target.value.split("\n") : e.target.value))
                        }
                      />
                      {f.ai && (
                        <AssistButton
                          kind={f.ai}
                          notes={value}
                          context={ctx}
                          onResult={(r: AssistResult) =>
                            set((d) => {
                              const target = d[k][idx] as unknown as Record<string, unknown>;
                              if (isBullets) target[f.key] = r.bullets.length ? r.bullets : r.text.split("\n");
                              else target[f.key] = r.text || r.bullets.join(" ");
                            })
                          }
                        />
                      )}
                    </div>
                  );
                })}
              <button type="button" className="text-sm font-semibold text-pink-s underline" onClick={() => set((d) => ((d[k] as unknown[]).splice(idx, 1)))}>
                Hapus
              </button>
            </div>
          )}
        />
        <button
          type="button"
          className="btn btn-soft"
          onClick={() =>
            set((d) => {
              const blank: Record<string, unknown> = { id: uid() };
              def.fields.forEach((f) => (blank[f.key] = f.kind === "bullets" ? [""] : ""));
              (d[k] as unknown[]).push(blank);
            })
          }
        >
          {def.addLabel}
        </button>
      </div>
    );
  };

  const body = () => {
    switch (step) {
      case "personal": {
        const p = cv.personal;
        const up = (key: keyof CVData["personal"]) => (v: string) => set((d) => void (d.personal[key] = v));
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <F id="p-name" label="Nama lengkap" value={p.name} onChange={up("name")} />
              <F id="p-title" label="Jabatan / headline" value={p.title} onChange={up("title")} placeholder="Digital Marketing Specialist" />
              <F id="p-email" label="Email" type="email" value={p.email} onChange={up("email")} />
              <F id="p-phone" label="Telepon" type="tel" value={p.phone} onChange={up("phone")} placeholder="+62 812-3456-7890" />
              <F id="p-loc" label="Domisili" value={p.location} onChange={up("location")} placeholder="Jakarta Selatan" />
              <F id="p-li" label="LinkedIn" value={p.linkedin} onChange={up("linkedin")} placeholder="linkedin.com/in/nama" />
              <F id="p-pf" label="Portofolio / GitHub" value={p.portfolio} onChange={up("portfolio")} />
            </div>
            <div className="rounded-2xl bg-surface2 p-4">
              <p className="font-bold">Foto (opsional)</p>
              <p className="mt-1 rounded-xl bg-lemon p-3 text-xs text-lemon-s">
                ⚠️ Template <b>ATS Strict</b> tanpa foto lebih aman untuk sistem ATS. Template dengan foto cocok untuk pengiriman langsung (email/WhatsApp) atau format
                lamaran Indonesia.
              </p>
              {crop ? (
                <div className="mt-3">
                  <PhotoCropper
                    file={crop}
                    onCancel={() => setCrop(null)}
                    onDone={(url) => {
                      set((d) => {
                        d.personal.photo = url;
                        d.settings.showPhoto = true;
                        if (d.settings.template === "ats") d.settings.template = "photo";
                      });
                      setCrop(null);
                    }}
                  />
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {p.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo} alt="Foto profil" className="h-16 w-16 rounded-full object-cover" />
                  )}
                  <label className="btn btn-soft cursor-pointer">
                    {p.photo ? "Ganti foto" : "Unggah foto"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && f.size <= 5 * 1024 * 1024) setCrop(f);
                        else if (f) setMsg("Ukuran foto maksimal 5 MB.");
                      }}
                    />
                  </label>
                  {p.photo && (
                    <>
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <input type="checkbox" checked={cv.settings.showPhoto} onChange={(e) => set((d) => void (d.settings.showPhoto = e.target.checked))} />
                        Tampilkan foto
                      </label>
                      <button type="button" className="text-sm underline" onClick={() => set((d) => void ((d.personal.photo = ""), (d.settings.showPhoto = false)))}>
                        Hapus foto
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
      case "summary":
        return (
          <div>
            <label htmlFor="summary" className="label">
              Ringkasan profil (atau catatan kasar tentang diri Anda)
            </label>
            <textarea id="summary" className="input min-h-36" value={cv.summary} onChange={(e) => set((d) => void (d.summary = e.target.value))} />
            <p className="mt-1 text-xs text-soft">{cv.summary.length} karakter · ideal 200–600</p>
            <AssistButton
              kind="summary"
              notes={cv.summary}
              context={[cv.personal.title, cv.experience.map((e) => e.role).join(", "), cv.skills.technical.join(", ")].filter(Boolean).join(" | ")}
              onResult={(r) => set((d) => void (d.summary = r.text || r.bullets.join(" ")))}
            />
          </div>
        );
      case "skills":
        return (
          <div className="space-y-4" key={rev}>
            <SkillInput id="sk-t" label="Skill teknis" items={cv.skills.technical} onChange={(v) => set((d) => void (d.skills.technical = v))} />
            <SkillInput id="sk-s" label="Skill non-teknis" items={cv.skills.soft} onChange={(v) => set((d) => void (d.skills.soft = v))} />
          </div>
        );
      case "design":
        return (
          <div className="space-y-6">
            <fieldset>
              <legend className="label">Template</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TEMPLATES.map((t) => (
                  <label
                    key={t.id}
                    className={`cursor-pointer rounded-2xl border-2 p-3 text-sm transition-colors ${cv.settings.template === t.id ? "border-lavender-s bg-lavender" : "border-line bg-surface"}`}
                  >
                    <input
                      type="radio"
                      name="template"
                      className="sr-only"
                      checked={cv.settings.template === t.id}
                      onChange={() =>
                        set((d) => {
                          d.settings.template = t.id;
                          if (t.id === "photo" && d.personal.photo) d.settings.showPhoto = true;
                        })
                      }
                    />
                    <b>{t.name}</b>
                    <span className="block text-xs text-soft">{t.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="paper">
                  Ukuran kertas
                </label>
                <select id="paper" className="input" value={cv.settings.paper} onChange={(e) => set((d) => void (d.settings.paper = e.target.value as "A4" | "Letter"))}>
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="fs">
                  Ukuran font: {cv.settings.fontSize} pt
                </label>
                <input id="fs" type="range" min={9} max={12} step={0.5} className="w-full" value={cv.settings.fontSize} onChange={(e) => set((d) => void (d.settings.fontSize = +e.target.value))} />
              </div>
              <div>
                <label className="label" htmlFor="sp">
                  Jarak: {cv.settings.spacing.toFixed(1)}×
                </label>
                <input id="sp" type="range" min={0.6} max={1.6} step={0.1} className="w-full" value={cv.settings.spacing} onChange={(e) => set((d) => void (d.settings.spacing = +e.target.value))} />
              </div>
              <fieldset>
                <legend className="label">Warna aksen</legend>
                <div className="flex gap-2">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Warna ${c}`}
                      aria-pressed={cv.settings.accent === c}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${cv.settings.accent === c ? "border-ink" : "border-transparent"}`}
                      style={{ background: c }}
                      onClick={() => set((d) => void (d.settings.accent = c))}
                    />
                  ))}
                </div>
                {cv.settings.template === "ats" && <p className="mt-1 text-xs text-soft">Template ATS Strict memakai warna hitam.</p>}
              </fieldset>
            </div>

            <div>
              <p className="label">Urutan bagian (seret atau gunakan tombol panah)</p>
              <SortableList
                items={cv.sectionOrder.map((k) => ({ id: k }))}
                onChange={(n) => set((d) => void (d.sectionOrder = n.map((x) => x.id as SectionKey)))}
                label={(i) => SECTION_TITLES[i.id as SectionKey]}
                render={() => null}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" disabled={!!exporting} onClick={() => doExport("pdf")}>
                {exporting === "pdf" ? "Membuat PDF…" : "⬇ Ekspor PDF"}
              </button>
              <button className="btn btn-soft" disabled={!!exporting} onClick={() => doExport("docx")}>
                {exporting === "docx" ? "Membuat DOCX…" : "⬇ Ekspor DOCX"}
              </button>
            </div>
            <p className="text-xs text-soft">PDF berisi teks asli (bukan gambar) sehingga bisa diseleksi dan dibaca ATS.</p>
          </div>
        );
      default:
        return renderList(step);
    }
  };

  if (!hydrated) return <div className="mx-auto max-w-6xl px-4 py-10"><div className="skeleton h-96" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Confetti show={confetti} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-soft" onClick={() => setShowImport((s) => !s)} aria-expanded={showImport}>
          📥 Impor dari CV
        </button>
        <button
          className="btn btn-soft"
          onClick={() => {
            if (confirm("Kosongkan seluruh isi CV?")) {
              setCv(emptyCV());
              setRev((r) => r + 1);
            }
          }}
        >
          Kosongkan
        </button>
        <span className="text-xs text-soft">✓ Tersimpan otomatis di browser Anda</span>
      </div>

      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
            <div className="card space-y-3 bg-mint/40 p-5">
              <p className="text-sm">Unggah CV lama (PDF/DOCX). AI akan menyalin datanya ke form tanpa mengubah isinya.</p>
              <UploadZone file={importFile} onFile={setImportFile} tone="mint" />
              <button className="btn btn-primary" disabled={!importFile || importing} onClick={doImport}>
                {importing ? "Membaca CV…" : "Impor data"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {msg && (
        <p role="status" className="mb-4 rounded-xl bg-sky px-4 py-2 text-sm font-semibold text-sky-s">
          {msg}
        </p>
      )}

      <div className="mb-4 flex gap-2 lg:hidden" role="tablist" aria-label="Tampilan">
        <button role="tab" aria-selected={tab === "form"} className={`btn flex-1 ${tab === "form" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("form")}>
          Form
        </button>
        <button role="tab" aria-selected={tab === "preview"} className={`btn flex-1 ${tab === "preview" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("preview")}>
          Preview
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`${tab === "form" ? "block" : "hidden"} lg:block`}>
          <nav aria-label="Langkah" className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <button
                key={s}
                aria-current={s === step ? "step" : undefined}
                onClick={() => setStep(s)}
                className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${s === step ? "text-ink" : "bg-surface2 text-soft"}`}
              >
                {s === step && <motion.span layoutId="step-pill" className="absolute inset-0 -z-0 rounded-full bg-mint" />}
                <span className="relative z-10">
                  {i + 1}. {STEP_LABEL[s]}
                </span>
              </button>
            ))}
          </nav>
          <div className="card p-6">
            <h2 className="mb-4 font-display text-xl font-bold">{STEP_LABEL[step]}</h2>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                {body()}
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex justify-between">
              <button className="btn btn-soft" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1])}>
                ← Sebelumnya
              </button>
              <button className="btn btn-primary" disabled={stepIndex === STEPS.length - 1} onClick={() => setStep(STEPS[stepIndex + 1])}>
                Berikutnya →
              </button>
            </div>
          </div>
        </div>

        <div className={`${tab === "preview" ? "block" : "hidden"} space-y-4 lg:block`}>
          <div className="card flex items-center gap-4 p-4">
            <ScoreGauge score={ats.score} size={96} label="ATS" />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold">Skor ATS (aturan lokal)</p>
              <ul className="mt-1 max-h-24 space-y-0.5 overflow-auto text-xs text-soft">
                {ats.checks.filter((c) => !c.passed).map((c) => (
                  <li key={c.label}>✗ {c.tip}</li>
                ))}
                {ats.checks.every((c) => c.passed) && <li className="text-mint-s">✓ Semua pemeriksaan lolos</li>}
              </ul>
            </div>
          </div>
          <div className="lg:sticky lg:top-20">
            <FitPage paper={cv.settings.paper}>
              <CVPreview cv={cv} />
            </FitPage>
          </div>
        </div>
      </div>
    </div>
  );
}
