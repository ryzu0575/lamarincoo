"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import InterviewChat from "./InterviewChat";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating launcher trigger button */}
      <aside aria-label="Widget AI Interview">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Buka Chat AI Interview Coach"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-lavender-strong/40 bg-gradient-to-r from-lavender-strong to-sky-strong px-4 py-3 text-sm font-bold text-white shadow-lift backdrop-blur-md transition-all hover:shadow-2xl cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-strong opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-mint-strong" />
          </span>
          <span className="text-base">🎙️</span>
          <span className="hidden sm:inline">Tanya Tips Interview</span>
          {isOpen ? "✕" : ""}
        </motion.button>
      </aside>

      {/* Floating Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 pointer-events-none">
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto relative w-full sm:w-[480px] max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-line bg-surface shadow-2xl overflow-hidden"
            >
              {/* Widget Navigation Bar */}
              <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <span>🎙️</span>
                  <span>AI Interview Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/interview"
                    onClick={() => setIsOpen(false)}
                    className="text-soft hover:text-lavender-strong transition-colors underline font-medium"
                  >
                    Buka Halaman Penuh ↗
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 rounded-full bg-surface border border-line text-soft hover:text-ink flex items-center justify-center font-bold text-xs"
                    aria-label="Tutup widget"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-hidden">
                <InterviewChat embedded={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
