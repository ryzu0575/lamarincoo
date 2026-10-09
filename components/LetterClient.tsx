"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import UploadZone from "./UploadZone";
import AiProgress from "./AiProgress";
import ScoreGauge, { MiniBar } from "./ScoreGauge";
import Confetti from "./Confetti";
import { Disclaimer } from "./Motion";
import { Checklist, IssueList, RewriteList, Section, StrengthList } from "./ReviewParts";
import { apiPost } from "@/lib/client";
import { exportLetterDocx, exportLetterPdf } from "@/lib/exporters";
import { KEYS, useLocalStorage } from "@/lib/storage";
import type { Letter, LetterReview } from "@/lib/schemas";
import type { CVData } from "@/lib/types";

interface LetterForm {
  name: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  companyAddress: string;
  position: string;
  source: string;
  strengths: string;
  motivation: string;
  attachments: string;
  placeDate: string;
  tone: "klasik" | "modern" | "antusias";
  language: "id" | "en";
  length: "singkat" | "sedang" | "panjang";
}

const EMPTY_FORM: LetterForm = {
  name: "", email: "", phone: "", location: "", company: "", companyAddress: "", position: "", source: "",
  strengths: "", motivation: "", attachments: "CV, ijazah, transkrip nilai", placeDate: "",
  tone: "modern", language: "id", length: "sedang",
};

function ReviewTab() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [paste, setPaste] = useState(false);
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<LetterReview | null>(null);

  const submit = async () => {
    setLoading(true);
    setError("");
    setReview(null);
    try {
      const fd = new FormData();
      if (!paste && file) fd.append("file", file);
      if (paste) fd.append("text", text);
      fd.append("position", position);
      fd.append("company", company);
      fd.append("jd", jd);
      const { review: r } = await apiPost<{ review: LetterReview }>("/api/review-letter", fd);
      setReview(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const ok = paste ? text.trim().length >= 30 : !!file;

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-6">
        <div className="flex gap-2" role="tablist" aria-label="Metode input">
          <button role="tab" aria-selected={!paste} className={`btn ${!paste ? "btn-primary" : "btn-soft"}`} onClick={() => setPaste(false)}>
            Unggah file
          </button>
          <button role="tab" aria-selected={paste} className={`btn ${paste ? "btn-primary" : "btn-soft"}`} onClick={() => setPaste(true)}>
            Tempel teks
          </button>
        </div>
        {paste ? (
          <div>
            <label htmlFor="ltr-text" className="label">
              Teks surat lamaran
            </label>
            <textarea id="ltr-text" className="input min-h-48" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        ) : (
          <UploadZone file={file} onFile={setFile} tone="peach" label="Seret & lepas surat lamaran di sini" />
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="r-pos" className="label">
              Posisi dituju (opsional)
            </label>
            <input id="r-pos" className="input" value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>
          <div>
            <label htmlFor="r-co" className="label">
              Perusahaan (opsional)
            </label>
            <input id="r-co" className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="r-jd" className="label">
            Job description (opsional)
          </label>
          <textarea id="r-jd" className="input min-h-28" value={jd} onChange={(e) => setJd(e.target.value)} />
        </div>
        <button className="btn btn-primary w-full" disabled={!ok || loading} onClick={submit}>
          {loading ? "Menganalisis…" : "Review surat lamaran"}
        </button>
        {error && (
          <p role="alert" className="rounded-xl bg-pink px-3 py-2 text-sm font-semibold text-pink-s">
            {error}
          </p>
        )}
        <Disclaimer />
      </div>

      {loading && <AiProgress />}

      {review && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <section className="card grid gap-8 bg-peach/40 p-8 md:grid-cols-[200px_1fr]">
            <div className="flex justify-center">
              <ScoreGauge score={review.overallScore} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold">Skor surat lamaran</h2>
              <p className="mt-1 text-sm">{review.summary}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <MiniBar label="Struktur surat" value={review.subScores.structure} />
                <MiniBar label="Tone & kesopanan" value={review.subScores.tone} />
                <MiniBar label="Ejaan & tata bahasa" value={review.subScores.grammar} />
                <MiniBar label="Relevansi lowongan" value={review.subScores.relevance} />
                <MiniBar label="Dampak & daya tarik" value={review.subScores.impact} />
              </div>
            </div>
          </section>
          <Section title="Kekuatan" tone="bg-mint" id="l-kuat">
            <StrengthList items={review.strengths} />
          </Section>
          <Section title="Kritik & masalah" tone="bg-pink" id="l-kritik">
            <IssueList items={review.issues} />
          </Section>
          <Section title="Kesesuaian dengan lowongan" tone="bg-sky" id="l-fit">
            <p className="text-sm">{review.jobFit}</p>
          </Section>
          <Section title="Tone & kesopanan" tone="bg-lavender" id="l-tone">
            <p className="text-sm">{review.toneAnalysis}</p>
          </Section>
          <Section title="Ejaan & tata bahasa (EYD/PUEBI)" tone="bg-lemon" id="l-gram">
            {review.grammarErrors.length === 0 ? (
              <p className="text-sm text-mint-s">Tidak ditemukan kesalahan berarti. 🎉</p>
            ) : (
              <ul className="space-y-2">
                {review.grammarErrors.map((g, i) => (
                  <li key={i} className="rounded-2xl bg-surface2 p-3 text-sm">
                    <span className="text-pink-s line-through">{g.original}</span> → <b className="text-mint-s">{g.correction}</b>
                    <span className="block text-xs text-soft">{g.rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Struktur surat resmi" tone="bg-peach" id="l-struktur">
            <Checklist items={review.structureChecklist} />
          </Section>
          <Section title="Saran sebelum → sesudah" tone="bg-mint" id="l-rewrite">
            <RewriteList items={review.rewrites} />
          </Section>
        </motion.div>
      )}
    </div>
  );
}

const SELECT = "input";

function CreateTab() {
  const [form, setForm] = useLocalStorage<LetterForm>(KEYS.letterForm, EMPTY_FORM);
  const [letter, setLetter] = useLocalStorage<Letter | null>(KEYS.letter, null);
  const [cv] = useLocalStorage<CVData | null>(KEYS.cv, null);
  const [loading, setLoading] = useState(false);
  const [regen, setRegen] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");
  const [confetti, setConfetti] = useState(false);

  const up = <K extends keyof LetterForm>(k: K, v: LetterForm[K]) => setForm({ ...form, [k]: v });

  const fromCV = () => {
    if (!cv) return;
    const p = cv.personal;
    const exp = cv.experience
      .slice(0, 3)
      .map((e) => `${e.role} di ${e.company}: ${e.bullets.filter(Boolean).slice(0, 2).join("; ")}`)
      .join("\n");
    setForm({
      ...form,
      name: p.name || form.name,
      email: p.email || form.email,
      phone: p.phone || form.phone,
      location: p.location || form.location,
      position: form.position || p.title,
      strengths: [exp, cv.skills.technical.slice(0, 8).join(", ") && `Skill: ${cv.skills.technical.slice(0, 8).join(", ")}`, cv.summary].filter(Boolean).join("\n") || form.strengths,
    });
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const { letter: l } = await apiPost<{ letter: Letter }>("/api/generate-letter", { form, tone: form.tone, language: form.language, length: form.length });
      setLetter(l);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async (i: number) => {
    if (!letter) return;
    setRegen(i);
    setError("");
    try {
      const { paragraph } = await apiPost<{ paragraph: string }>("/api/generate-letter", {
        mode: "paragraph",
        paragraph: letter.paragraphs[i],
        tone: form.tone,
        language: form.language,
        context: `Melamar ${form.position} di ${form.company}`,
      });
      setLetter({ ...letter, paragraphs: letter.paragraphs.map((p, j) => (j === i ? paragraph : p)) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegen(null);
    }
  };

  const exp = async (type: "pdf" | "docx") => {
    if (!letter) return;
    setExporting(type);
    try {
      if (type === "pdf") await exportLetterPdf(letter);
      else await exportLetterDocx(letter);
    } catch {
      setError("Gagal mengekspor.");
    } finally {
      setExporting("");
    }
  };

  const T = (id: string, label: string, k: keyof LetterForm, placeholder?: string) => (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input id={id} className="input" placeholder={placeholder} value={String(form[k])} onChange={(e) => up(k, e.target.value as never)} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Confetti show={confetti} />
      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Data surat</h2>
          <button className="btn btn-soft !py-1.5 !text-sm" onClick={fromCV} disabled={!cv?.personal?.name}>
            Ambil dari CV Builder
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {T("f-name", "Nama lengkap", "name")}
          {T("f-email", "Email", "email")}
          {T("f-phone", "Telepon", "phone")}
          {T("f-loc", "Domisili", "location")}
          {T("f-co", "Perusahaan tujuan", "company")}
          {T("f-pos", "Posisi dilamar", "position")}
          {T("f-addr", "Kota/alamat perusahaan", "companyAddress")}
          {T("f-src", "Sumber lowongan", "source", "LinkedIn, JobStreet, dll.")}
          {T("f-date", "Tempat, tanggal surat", "placeDate", "Jakarta, 6 Oktober 2026")}
          {T("f-att", "Lampiran", "attachments")}
        </div>
        <div>
          <label htmlFor="f-str" className="label">
            Pengalaman / keunggulan utama
          </label>
          <textarea id="f-str" className="input min-h-28" value={form.strengths} onChange={(e) => up("strengths", e.target.value)} />
        </div>
        <div>
          <label htmlFor="f-mot" className="label">
            Motivasi melamar
          </label>
          <textarea id="f-mot" className="input min-h-20" value={form.motivation} onChange={(e) => up("motivation", e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="f-tone" className="label">
              Tone
            </label>
            <select id="f-tone" className={SELECT} value={form.tone} onChange={(e) => up("tone", e.target.value as LetterForm["tone"])}>
              <option value="klasik">Formal klasik</option>
              <option value="modern">Formal modern</option>
              <option value="antusias">Antusias profesional</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-lang" className="label">
              Bahasa
            </label>
            <select id="f-lang" className={SELECT} value={form.language} onChange={(e) => up("language", e.target.value as LetterForm["language"])}>
              <option value="id">Indonesia</option>
              <option value="en">Inggris</option>
            </select>
          </div>
          <div>
            <label htmlFor="f-len" className="label">
              Panjang
            </label>
            <select id="f-len" className={SELECT} value={form.length} onChange={(e) => up("length", e.target.value as LetterForm["length"])}>
              <option value="singkat">Singkat</option>
              <option value="sedang">Sedang</option>
              <option value="panjang">Panjang</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary w-full" disabled={loading || !form.company || !form.position} onClick={generate}>
          {loading ? "Menyusun surat…" : "✉️ Buat surat lamaran"}
        </button>
        {error && (
          <p role="alert" className="rounded-xl bg-pink px-3 py-2 text-sm font-semibold text-pink-s">
            {error}
          </p>
        )}
        <Disclaimer />
      </div>

      <div className="space-y-4">
        {loading && <AiProgress />}
        {letter && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card space-y-3 bg-surface p-6">
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary !py-2" disabled={!!exporting} onClick={() => exp("pdf")}>
                {exporting === "pdf" ? "Membuat…" : "⬇ PDF"}
              </button>
              <button className="btn btn-soft !py-2" disabled={!!exporting} onClick={() => exp("docx")}>
                {exporting === "docx" ? "Membuat…" : "⬇ DOCX"}
              </button>
              <button className="btn btn-soft !py-2" onClick={() => setLetter(null)}>
                Hapus
              </button>
            </div>
            <p className="text-xs text-soft">Semua bagian dapat diedit langsung. Gunakan “Buat ulang” untuk menulis ulang satu paragraf.</p>
            {(
              [
                ["placeDate", "Tempat, tanggal"],
                ["attachment", "Lampiran"],
                ["subject", "Perihal"],
                ["recipient", "Tujuan"],
                ["salutation", "Salam pembuka"],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <label htmlFor={`e-${k}`} className="label">
                  {l}
                </label>
                <textarea id={`e-${k}`} rows={k === "recipient" ? 3 : 1} className="input editable" value={letter[k]} onChange={(e) => setLetter({ ...letter, [k]: e.target.value })} />
              </div>
            ))}
            {letter.paragraphs.map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <label htmlFor={`e-p${i}`} className="label">
                    Paragraf {i + 1}
                  </label>
                  <button className="text-xs font-bold underline" disabled={regen !== null} onClick={() => regenerate(i)}>
                    {regen === i ? "Menulis ulang…" : "↻ Buat ulang"}
                  </button>
                </div>
                <textarea
                  id={`e-p${i}`}
                  className="input editable min-h-28"
                  value={p}
                  onChange={(e) => setLetter({ ...letter, paragraphs: letter.paragraphs.map((x, j) => (j === i ? e.target.value : x)) })}
                />
              </div>
            ))}
            {(
              [
                ["closing", "Salam penutup"],
                ["name", "Nama"],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <label htmlFor={`e-${k}`} className="label">
                  {l}
                </label>
                <input id={`e-${k}`} className="input editable" value={letter[k]} onChange={(e) => setLetter({ ...letter, [k]: e.target.value })} />
              </div>
            ))}
          </motion.div>
        )}
        {!letter && !loading && (
          <div className="card flex h-64 items-center justify-center bg-peach/40 p-6 text-center text-sm text-soft">
            Isi data di samping lalu klik “Buat surat lamaran”. Hasilnya bisa Anda edit dan unduh di sini.
          </div>
        )}
      </div>
    </div>
  );
}

export default function LetterClient() {
  const [tab, setTab] = useState<"review" | "create">("review");
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex gap-2" role="tablist" aria-label="Mode surat lamaran">
        <button role="tab" aria-selected={tab === "review"} className={`btn ${tab === "review" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("review")}>
          Review surat
        </button>
        <button role="tab" aria-selected={tab === "create"} className={`btn ${tab === "create" ? "btn-primary" : "btn-soft"}`} onClick={() => setTab("create")}>
          Buat surat
        </button>
      </div>
      {tab === "review" ? <ReviewTab /> : <CreateTab />}
    </div>
  );
}
