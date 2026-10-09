import type { Metadata } from "next";
import { PageHeader, Reveal } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Tips CV & ATS",
  description: "Tips singkat menulis CV yang ramah ATS dan menarik bagi rekruter di Indonesia.",
};

const tips = [
  ["Satu kolom, struktur linear", "Hindari tabel, kolom ganda, dan teks di dalam gambar; ATS membaca dari atas ke bawah.", "bg-lavender"],
  ["Gunakan heading standar", "Pengalaman Kerja, Pendidikan, Keahlian. Heading kreatif sering tidak dikenali ATS.", "bg-mint"],
  ["Aksi + dampak + angka", "“Meningkatkan konversi 18% dalam 3 bulan” jauh lebih kuat daripada “bertanggung jawab atas pemasaran”.", "bg-peach"],
  ["Cocokkan kata kunci", "Baca job description, lalu pakai istilah yang sama (jika memang Anda kuasai) pada CV.", "bg-sky"],
  ["Format tanggal konsisten", "Pilih satu format, mis. “Jan 2022 – Mar 2024”, dan pakai di seluruh CV.", "bg-lemon"],
  ["Foto: sesuaikan tujuan", "Untuk portal/ATS, tanpa foto lebih aman. Untuk kirim langsung (email/WA), foto formal boleh dipakai.", "bg-pink"],
  ["Ekspor sebagai PDF teks", "Jangan screenshot CV. Gunakan PDF dengan teks asli agar bisa diseleksi dan dibaca ATS.", "bg-lavender"],
  ["Panjang 1–2 halaman", "Fresh graduate cukup 1 halaman. Fokus pada pengalaman paling relevan.", "bg-mint"],
];

import Link from "next/link";

export default function TipsPage() {
  return (
    <>
      <PageHeader title="Tips CV & ATS" subtitle="Delapan kebiasaan sederhana yang membuat CV Anda lebih mudah lolos dan dibaca." tone="lemon" />
      
      {/* Banner Menuju Tanya AI Interview */}
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <Reveal>
          <div className="card flex flex-col sm:flex-row items-center justify-between gap-5 p-6 sm:p-8 bg-gradient-to-r from-sky/40 via-surface to-lavender/40 border-line">
            <div className="flex items-center gap-4">
              <span className="text-4xl shrink-0">🎙️</span>
              <div>
                <span className="chip bg-mint text-mint-strong text-xs font-bold mb-1">Fitur Baru</span>
                <h2 className="font-display text-xl font-bold text-ink">
                  Sudah Siap Dipanggil Interview?
                </h2>
                <p className="text-sm text-soft mt-1 max-w-xl">
                  Konsultasikan tips lolos wawancara HRD & User, trik negosiasi gaji, dan lakukan simulasi wawancara interaktif bersama Coach Lamarin.
                </p>
              </div>
            </div>
            <Link href="/interview" className="btn btn-primary shrink-0 whitespace-nowrap">
              Tanya AI Interview →
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:grid-cols-2">
        {tips.map(([t, d, bg], i) => (
          <Reveal key={t} delay={(i % 2) * 0.08}>
            <article className={`card card-hover h-full p-6 ${bg}`}>
              <h2 className="font-display text-lg font-bold">
                {i + 1}. {t}
              </h2>
              <p className="mt-2 text-sm">{d}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </>
  );
}
