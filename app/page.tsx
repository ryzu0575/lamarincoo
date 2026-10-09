import Link from "next/link";
import Hero from "@/components/Hero";
import { Reveal } from "@/components/Motion";
import ScoreGauge, { MiniBar } from "@/components/ScoreGauge";

const features = [
  {
    href: "/review-cv",
    title: "Review CV",
    desc: "Unggah CV, dapatkan skor, kritik berprioritas, saran sebelum → sesudah, dan analisis kecocokan kata kunci.",
    bg: "bg-lavender",
    emoji: "🔍",
  },
  {
    href: "/buat-cv",
    title: "CV Builder",
    desc: "Buat CV ATS-friendly dengan 4 template, bantuan AI, preview langsung, dan ekspor PDF/DOCX.",
    bg: "bg-mint",
    emoji: "🧩",
  },
  {
    href: "/surat-lamaran",
    title: "Surat Lamaran",
    desc: "Review surat lamaran atau buat baru dengan struktur resmi Indonesia dan tone yang Anda pilih.",
    bg: "bg-peach",
    emoji: "✉️",
  },
  {
    href: "/interview",
    title: "Tanya AI Interview",
    desc: "Tips lolos wawancara HRD & User, metode STAR, strategi negosiasi gaji, dan simulasi interview interaktif.",
    bg: "bg-sky",
    emoji: "🎙️",
  },
];

const steps = [
  { n: 1, title: "Unggah atau isi data", desc: "Upload CV/surat, atau isi form pembuat CV." },
  { n: 2, title: "AI menganalisis", desc: "Dinilai seperti reviewer rekrutmen di Indonesia." },
  { n: 3, title: "Perbaiki & unduh", desc: "Terapkan saran, lalu ekspor PDF atau DOCX." },
];

const faqs = [
  ["Apakah Lamarin gratis?", "Ya. Anda hanya perlu menjalankannya dengan API key Gemini milik sendiri (ada kuota gratis)."],
  ["Apakah file CV saya disimpan?", "Tidak. File hanya diproses untuk review dan tidak disimpan di server. Draft Anda tersimpan di browser (localStorage) dan dapat dihapus kapan saja."],
  ["Apakah CV hasil Lamarin terbaca ATS?", "Ya. Template memakai satu kolom, heading standar, font aman, dan PDF dengan teks asli yang dapat diseleksi."],
  ["Apakah hasil AI menjamin lolos seleksi?", "Tidak. Hasil AI adalah masukan untuk memperbaiki dokumen, bukan jaminan lolos."],
];

export default function Home() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="fitur">
        <Reveal>
          <h2 id="fitur" className="text-center font-display text-3xl font-extrabold">
            Solusi Menyeluruh untuk Diterima Kerja
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.href} delay={i * 0.08}>
              <Link href={f.href} className={`card card-hover block h-full p-6 ${f.bg}`}>
                <div className="text-4xl" aria-hidden>
                  {f.emoji}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink">{f.desc}</p>
                <span className="mt-5 inline-block text-xs font-bold text-ink">Coba sekarang →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="cara">
        <Reveal>
          <h2 id="cara" className="text-center font-display text-3xl font-extrabold">
            Cara kerja 3 langkah
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <li className="card p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky font-display font-extrabold text-sky-s">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-soft">{s.desc}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="contoh">
        <Reveal>
          <h2 id="contoh" className="text-center font-display text-3xl font-extrabold">
            Contoh hasil review
          </h2>
          <p className="mt-2 text-center text-sm text-soft">Ilustrasi (data contoh, bukan hasil nyata)</p>
        </Reveal>
        <Reveal>
          <div className="card mt-8 grid gap-8 bg-sky/40 p-8 md:grid-cols-[200px_1fr]">
            <div className="flex justify-center">
              <ScoreGauge score={72} />
            </div>
            <div className="space-y-3">
              <MiniBar label="ATS-friendliness" value={80} />
              <MiniBar label="Struktur & format" value={74} />
              <MiniBar label="Kejelasan & bahasa" value={68} />
              <MiniBar label="Dampak & pencapaian" value={55} />
              <div className="mt-4 rounded-2xl bg-surface p-4 text-sm">
                <p className="font-bold text-pink-s">Prioritas Tinggi</p>
                <p className="mt-1 text-soft">
                  “Bertanggung jawab atas penjualan” <span className="font-bold">→</span> “Meningkatkan penjualan 24% dalam 6 bulan
                  melalui program upselling.”
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="aman">
        <Reveal>
          <div className="card flex flex-col items-center gap-3 bg-mint p-8 text-center">
            <h2 id="aman" className="font-display text-2xl font-extrabold">
              🔒 Data Anda aman
            </h2>
            <p className="max-w-2xl text-sm">
              File hanya diproses untuk review dan tidak disimpan di server. Draft tersimpan di browser Anda, dan Anda bisa menghapus
              semuanya kapan saja.
            </p>
            <Link href="/privasi" className="btn btn-primary mt-2">
              Baca kebijakan privasi
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12" aria-labelledby="faq">
        <Reveal>
          <h2 id="faq" className="text-center font-display text-3xl font-extrabold">
            Pertanyaan umum
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <Reveal key={q}>
              <details className="card group p-5">
                <summary className="cursor-pointer list-none font-bold marker:hidden">{q}</summary>
                <p className="mt-2 text-sm text-soft">{a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
