import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import FloatingChatWidget from "@/components/FloatingChatWidget";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Lamarin — Asisten Karier & Interview Berbasis AI", template: "%s · Lamarin" },
  description:
    "Review CV, buat CV ATS-friendly, review dan buat surat lamaran kerja, serta tanya tips & simulasi interview kerja dengan AI. Gratis, tanpa login, untuk pasar kerja Indonesia.",
  keywords: ["review CV", "CV ATS", "surat lamaran kerja", "interview kerja", "tips interview", "AI karier", "Lamarin"],
  openGraph: {
    title: "Lamarin — Asisten Karier & Interview Berbasis AI",
    description: "Review CV, buat CV ATS-friendly, surat lamaran, dan tips lolos interview kerja dengan AI.",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1222",
};

const forceDarkScript = `document.documentElement.classList.add('dark');try{localStorage.setItem('lamarin:theme','"dark"')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`dark ${jakarta.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: forceDarkScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased bg-bg text-ink">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
        >
          Lewati ke konten
        </a>
        <Providers>
          <Navbar />
          <main id="konten" className="flex-1">
            {children}
          </main>
          <FloatingChatWidget />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
