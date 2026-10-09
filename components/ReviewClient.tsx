"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import UploadZone from "./UploadZone";
import AiProgress from "./AiProgress";
import Confetti from "./Confetti";
import ScoreGauge, { MiniBar } from "./ScoreGauge";
import { Disclaimer } from "./Motion";
import { Checklist, IssueList, KeywordChips, RewriteList, Section, StrengthList } from "./ReviewParts";
import { apiPost } from "@/lib/client";
import { KEYS, useLocalStorage, writeStore, removeStore, type ReviewRecord } from "@/lib/storage";
import type { CVReview } from "@/lib/schemas";
import { uid, type CVData } from "@/lib/types";

const EMPTY: ReviewRecord[] = [];

export default function ReviewClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [position, setPosition] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<CVReview | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [confetti, setConfetti] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const [history] = useLocalStorage<ReviewRecord[]>(KEYS.reviews, EMPTY);

  const buildForm = () => {
    const fd = new FormData();
    if (!pasteMode && file) fd.append("file", file);
    if (pasteMode) fd.append("text", text);
    fd.append("position", position);
    fd.append("jd", jd);
    return fd;
  };

  const canSubmit = pasteMode ? text.trim().length >= 30 : !!file;

  const submit = async () => {
    setError("");
    setReview(null);
    setDone({});
    setLoading(true);
    try {
      const { review: r } = await apiPost<{ review: CVReview }>("/api/review-cv", buildForm());
      setReview(r);
      const label = (!pasteMode && file?.name) || position || "CV (teks tempel)";
      const prev = history[0];
      writeStore(KEYS.reviews, [
        { id: uid(), date: new Date().toISOString(), label, score: r.overallScore, subScores: r.subScores },
        ...history,
      ].slice(0, 20));
      if (prev && r.overallScore > prev.score) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3500);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const autoFix = async () => {
    if (!review) return;
    setError("");
    setFixing(true);
    try {
      const fd = buildForm();
      fd.append("mode", "improve");
      fd.append("review", review.issues.map((i) => `- [${i.priority}] ${i.title}: ${i.suggestion}`).join("\n"));
      const { cv } = await apiPost<{ cv: CVData }>("/api/improve-cv", fd);
      writeStore(KEYS.cv, cv);
      router.push("/buat-cv");
    } catch (e) {
      setError((e as Error).message);
      setFixing(false);
    }
  };

  const subs = review
    ? [
        ["ATS-friendliness", review.subScores.ats],
        ["Struktur & format", review.subScores.structure],
        ["Kejelasan & bahasa", review.subScores.clarity],
        ["Dampak & pencapaian terukur", review.subScores.impact],
      ]
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Confetti show={confetti} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card space-y-5 p-6">
          <div className="flex gap-2" role="tablist" aria-label="Metode input">
            <button role="tab" aria-selected={!pasteMode} className={`btn ${!pasteMode ? "btn-primary" : "btn-soft"}`} onClick={() => setPasteMode(false)}>
              Unggah file
            </button>
            <button role="tab" aria-selected={pasteMode} className={`btn ${pasteMode ? "btn-primary" : "btn-soft"}`} onClick={() => setPasteMode(true)}>
              Tempel teks
            </button>
          </div>
          {pasteMode ? (
            <div>
              <label htmlFor="cv-text" className="label">
                Teks CV
              </label>
              <textarea id="cv-text" className="input min-h-48" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tempel isi CV Anda di sini…" />
            </div>
          ) : (
            <UploadZone file={file} onFile={setFile} />
          )}
          <div>
            <label htmlFor="position" className="label">
              Posisi / lowongan yang dituju (opsional)
            </label>
            <input id="position" className="input" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="mis. Digital Marketing Specialist" maxLength={200} />
          </div>
          <div>
            <label htmlFor="jd" className="label">
              Job description (opsional, tempel teks)
            </label>
            <textarea id="jd" className="input min-h-32" value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Tempel deskripsi lowongan untuk analisis kecocokan kata kunci…" />
          </div>
          <button className="btn btn-primary w-full" disabled={!canSubmit || loading} onClick={submit}>
            {loading ? "Menganalisis…" : "Review CV saya"}
          </button>
          {error && (
            <p role="alert" className="rounded-xl bg-pink px-3 py-2 text-sm font-semibold text-pink-s">
              {error}
            </p>
          )}
          <Disclaimer />
        </div>

        <aside className="card h-fit p-6" aria-labelledby="riwayat">
          <div className="flex items-center justify-between">
            <h2 id="riwayat" className="font-display text-lg font-bold">
              Riwayat review
            </h2>
            {history.length > 0 && (
              <button className="text-xs font-semibold underline" onClick={() => removeStore(KEYS.reviews)}>
                Hapus riwayat
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-soft">Belum ada. Hasil review tersimpan lokal agar Anda bisa membandingkan skor sebelum dan sesudah perbaikan.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.slice(0, 6).map((h, i) => {
                const next = history[i + 1];
                const delta = next ? h.score - next.score : null;
                return (
                  <li key={h.id} className="rounded-2xl bg-surface2 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate font-semibold">{h.label}</span>
                      <span className="ml-2 font-display font-extrabold">
                        {h.score}
                        {delta !== null && delta !== 0 && (
                          <span className={`ml-1 text-xs ${delta > 0 ? "text-mint-s" : "text-pink-s"}`}>
                            {delta > 0 ? "▲" : "▼"}
                            {Math.abs(delta)}
                          </span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-soft">{new Date(h.date).toLocaleString("id-ID")}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      <div ref={resultRef} className="mt-8 space-y-6 scroll-mt-24">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="load" exit={{ opacity: 0 }}>
              <AiProgress />
            </motion.div>
          )}
        </AnimatePresence>

        {review && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <section className="card grid gap-8 bg-lavender/40 p-8 md:grid-cols-[200px_1fr]" aria-label="Skor keseluruhan">
              <div className="flex justify-center">
                <ScoreGauge score={review.overallScore} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-extrabold">Skor keseluruhan</h2>
                <p className="mt-1 text-sm">{review.summary}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {subs.map(([l, v]) => (
                    <MiniBar key={l as string} label={l as string} value={v as number} />
                  ))}
                  {review.jobMatchAvailable && <MiniBar label="Kecocokan dengan lowongan" value={review.subScores.jobMatch} />}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary" disabled={fixing} onClick={autoFix}>
                {fixing ? "AI sedang memperbaiki…" : "✨ Perbaiki otomatis"}
              </button>
              <span className="text-sm text-soft">AI menulis ulang CV dan mengirimnya ke editor CV Builder.</span>
            </div>

            <Section title="Kelebihan" tone="bg-mint" id="kelebihan">
              <StrengthList items={review.strengths} />
            </Section>
            <Section title="Kritik & masalah" tone="bg-pink" id="kritik">
              <IssueList items={review.issues} />
            </Section>
            <Section title="Saran penulisan ulang" tone="bg-peach" id="rewrite">
              <RewriteList items={review.rewrites} />
            </Section>
            {review.jobMatchAvailable && (
              <Section title="Analisis kata kunci" tone="bg-sky" id="kata-kunci">
                <p className="mb-2 text-sm font-bold">Sudah cocok</p>
                <KeywordChips items={review.matchedKeywords} tone="mint" />
                <p className="mb-2 mt-4 text-sm font-bold">Kata kunci yang hilang</p>
                <KeywordChips items={review.missingKeywords} tone="pink" />
              </Section>
            )}
            <Section title="Checklist ATS" tone="bg-lemon" id="ats">
              <Checklist items={review.atsChecklist} />
            </Section>
            <Section title="Langkah perbaikan" tone="bg-lavender" id="langkah">
              <p className="mb-3 text-sm text-soft">
                {Object.values(done).filter(Boolean).length} dari {review.actionSteps.length} selesai
              </p>
              <ul className="space-y-2">
                {review.actionSteps.map((s, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface2 px-4 py-3 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[var(--lavender-strong)]"
                        checked={!!done[i]}
                        onChange={(e) => setDone((d) => ({ ...d, [i]: e.target.checked }))}
                      />
                      <span className={done[i] ? "text-soft line-through" : ""}>{s}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Section>
          </motion.div>
        )}
      </div>
    </div>
  );
}
