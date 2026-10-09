"use client";

import { motion, type Variants } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={list} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-lavender opacity-70 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-10 h-80 w-80 rounded-full bg-mint opacity-70 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-peach opacity-70 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-1/4 top-1/2 h-60 w-60 rounded-full bg-pink opacity-60 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="rounded-2xl bg-lemon px-4 py-3 text-sm text-lemon-s" role="note">
      ⚠️ Hasil AI adalah masukan, bukan jaminan lolos seleksi. Selalu periksa kembali sebelum mengirim lamaran.
    </p>
  );
}

export function PageHeader({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "lavender" | "mint" | "peach" | "lemon";
}) {
  const bg = { lavender: "bg-lavender", mint: "bg-mint", peach: "bg-peach", lemon: "bg-lemon" }[tone];
  return (
    <div className={`${bg} px-4 pb-12 pt-12`}>
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-soft">{subtitle}</p>
      </div>
    </div>
  );
}
