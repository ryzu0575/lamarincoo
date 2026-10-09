"use client";

import { MotionConfig } from "framer-motion";

/** Menghormati prefers-reduced-motion untuk semua animasi Framer Motion. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
