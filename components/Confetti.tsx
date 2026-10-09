"use client";

import { motion } from "framer-motion";

const COLORS = ["#c9b8ff", "#a8ecd0", "#ffc9ad", "#a9d6ff", "#fff0a0", "#ffb3d1"];

/** Konfeti pastel kecil. Posisi deterministik (tanpa Math.random saat render). */
export default function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 36 }).map((_, i) => {
        const left = (i * 37) % 100;
        const drift = Math.sin(i * 1.7) * 90;
        const size = 8 + (i % 4) * 3;
        return (
          <motion.span
            key={i}
            className="absolute top-0 block rounded-sm"
            style={{ left: `${left}%`, width: size, height: size * 0.6, background: COLORS[i % COLORS.length] }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: "100vh", x: drift, opacity: 0, rotate: 360 + i * 40 }}
            transition={{ duration: 2.2 + (i % 5) * 0.25, ease: "easeIn", delay: (i % 6) * 0.05 }}
          />
        );
      })}
    </div>
  );
}
