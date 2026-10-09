"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { t } from "@/lib/i18n";

const copy = t();
const links = [
  { href: "/review-cv", label: copy.nav.review, color: "bg-lavender", hover: "hover:bg-lavender" },
  { href: "/buat-cv", label: copy.nav.builder, color: "bg-mint", hover: "hover:bg-mint" },
  { href: "/surat-lamaran", label: copy.nav.letter, color: "bg-peach", hover: "hover:bg-peach" },
  { href: "/interview", label: "Tanya AI Interview 🎙️", color: "bg-sky", hover: "hover:bg-sky" },
  { href: "/tips", label: copy.nav.tips, color: "bg-lemon", hover: "hover:bg-lemon" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <nav aria-label="Navigasi utama" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          {copy.brand}
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${l.hover} ${active ? l.color : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Tutup" : "Menu"}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            id="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-bg px-4 md:hidden"
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-semibold">
                  {l.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
