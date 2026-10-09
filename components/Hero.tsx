"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Blobs } from "./Motion";

const words = ["Lamaran", "kerja", "lebih", "percaya", "diri,", "dibantu", "AI."];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-24 pt-20 text-center sm:pt-28">
      <Blobs />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="chip mx-auto mb-5 bg-surface text-lavender-s shadow-sm"
      >
        ✨ Asisten karier berbasis AI untuk pasar kerja Indonesia
      </motion.p>
      <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="mr-3 inline-block"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
          >
            {w}
          </motion.span>
        ))}
      </h1>
      <motion.p
        className="mx-auto mt-6 max-w-xl text-lg text-soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Review CV, buat CV ATS-friendly, susun surat lamaran, dan konsultasikan tips wawancara kerja. Gratis, tanpa login.
      </motion.p>
      <motion.div
        className="mt-9 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Link href="/review-cv" className="btn btn-primary">
          Review CV saya
        </Link>
        <Link href="/buat-cv" className="btn btn-soft">
          Buat CV baru
        </Link>
        <Link href="/interview" className="btn btn-soft border border-sky/40 text-sky-strong hover:bg-sky/30">
          🎙️ Tanya Tips Interview
        </Link>
      </motion.div>
    </section>
  );
}
