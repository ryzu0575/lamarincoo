"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export const MAX_BYTES = 5 * 1024 * 1024;

export function validateFile(f: File): string | null {
  const n = f.name.toLowerCase();
  if (!n.endsWith(".pdf") && !n.endsWith(".docx")) return "Format tidak didukung. Gunakan file PDF atau DOCX.";
  if (f.size === 0) return "File kosong. Pilih file lain.";
  if (f.size > MAX_BYTES) return "Ukuran file melebihi 5 MB. Kecilkan file lalu coba lagi.";
  return null;
}

export default function UploadZone({
  file,
  onFile,
  tone = "lavender",
  label = "Seret & lepas CV di sini",
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  tone?: "lavender" | "peach" | "mint";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const bg = { lavender: "bg-lavender", peach: "bg-peach", mint: "bg-mint" }[tone];

  const pick = (f?: File) => {
    if (!f) return;
    const err = validateFile(f);
    setError(err ?? "");
    onFile(err ? null : f);
  };

  return (
    <div>
      <motion.div
        animate={{ scale: drag ? 1.02 : 1 }}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
          drag ? `${bg} border-ink` : "border-line bg-surface"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          id="upload-file"
          type="file"
          className="sr-only"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <span className={`${bg} rounded-2xl px-4 py-2 text-sm font-bold`}>📄 {file.name}</span>
            <span className="text-xs text-soft">{(file.size / 1024).toFixed(0)} KB</span>
            <button
              type="button"
              className="text-sm font-semibold underline"
              onClick={() => {
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Hapus file
            </button>
          </div>
        ) : (
          <>
            <p className="font-display text-lg font-bold">{label}</p>
            <p className="mt-1 text-sm text-soft">PDF atau DOCX · maksimal 5 MB</p>
            <button type="button" className="btn btn-soft mt-4" onClick={() => inputRef.current?.click()}>
              Pilih file
            </button>
          </>
        )}
      </motion.div>
      {error && (
        <p role="alert" className="mt-2 rounded-xl bg-pink px-3 py-2 text-sm font-semibold text-pink-s">
          {error}
        </p>
      )}
    </div>
  );
}
