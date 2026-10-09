import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Lamarin — Asisten Karier Berbasis AI", template: "%s · Lamarin" },
  description:
    "Review CV, buat CV ATS-friendly, serta review dan buat surat lamaran kerja dengan AI. Gratis, tanpa login, untuk pasar kerja Indonesia.",
  keywords: ["review CV", "CV ATS", "surat lamaran kerja", "AI karier", "Lamarin"],
  openGraph: {
    title: "Lamarin — Asisten Karier Berbasis AI",
    description: "Review CV, buat CV ATS-friendly, dan surat lamaran dengan AI.",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf3" },
    { media: "(prefers-color-scheme: dark)", color: "#14172a" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('lamarin:theme');if(t==='"dark"'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
