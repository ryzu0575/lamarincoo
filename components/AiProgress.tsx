"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";

const s = t().status;
const STEPS = [s.reading, s.analyzing, s.composing];

/** Indikator progres + skeleton saat AI bekerja. Mount hanya saat loading. */
export default function AiProgress() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((x) => Math.min(x + 1, STEPS.length - 1)), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card p-6" role="status" aria-live="polite">
      <ol className="mb-6 flex flex-wrap gap-3">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`chip transition-colors ${
              i < step ? "bg-mint text-mint-s" : i === step ? "bg-lavender text-lavender-s" : "bg-surface2 text-soft"
            }`}
          >
            {i < step ? "✓" : i === step ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>◌</motion.span> : "○"}
            {label}
          </li>
        ))}
      </ol>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="skeleton h-44 w-44 rounded-full" />
        <div className="space-y-3">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-5 w-5/6" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
