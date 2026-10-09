"use client";

import { useState } from "react";
import { apiPost } from "@/lib/client";
import type { AssistResult } from "@/lib/schemas";

/** Tombol "Bantu tulis dengan AI". Catatan kasar diambil dari isi kolom saat ini. */
export default function AssistButton({
  kind,
  notes,
  context,
  onResult,
}: {
  kind: "summary" | "experience" | "project" | "organization" | "skills";
  notes: string;
  context?: string;
  onResult: (r: AssistResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  const run = async () => {
    setError("");
    setQuestions([]);
    setLoading(true);
    try {
      const { result } = await apiPost<{ result: AssistResult }>("/api/assist", { kind, notes, context });
      onResult(result);
      setQuestions(result.questions ?? []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button type="button" className="btn bg-lavender text-lavender-s !py-1.5 !text-sm" disabled={loading || notes.trim().length < 5} onClick={run}>
        {loading ? "AI sedang menulis…" : "✨ Bantu tulis dengan AI"}
      </button>
      {notes.trim().length < 5 && <span className="ml-2 text-xs text-soft">Tulis catatan kasar dulu.</span>}
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-pink-s">
          {error}
        </p>
      )}
      {questions.length > 0 && (
        <ul className="mt-2 rounded-xl bg-lemon p-3 text-xs text-lemon-s">
          <li className="font-bold">AI butuh info tambahan agar lebih akurat:</li>
          {questions.map((q, i) => (
            <li key={i}>• {q}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
