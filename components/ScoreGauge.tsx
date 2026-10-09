"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CountUp({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, value, { duration, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value, duration]);
  return <>{n}</>;
}

export const scoreColor = (s: number) =>
  s >= 75 ? "var(--mint-strong)" : s >= 50 ? "var(--lemon-strong)" : "var(--pink-strong)";

export default function ScoreGauge({ score, size = 180, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 20) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Skor ${score} dari 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={14} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-4xl font-extrabold" style={{ color: scoreColor(score) }}>
          <CountUp value={score} />
        </div>
        <div className="text-xs font-semibold text-soft">{label ?? "dari 100"}</div>
      </div>
    </div>
  );
}

export function MiniBar({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-semibold">
        <span>{label}</span>
        <span style={{ color: color ?? scoreColor(value) }}>{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface2" role="presentation">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color ?? scoreColor(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
}
