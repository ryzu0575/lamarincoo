import type { Metadata } from "next";
import { PageHeader, Reveal } from "@/components/Motion";
import InterviewChat from "@/components/InterviewChat";

export const metadata: Metadata = {
  title: "Tanya AI Interview & Tips Lolos Kerja",
  description:
    "Konsultasi persiapan wawancara kerja, trik menjawab pertanyaan HRD & User, formula metode STAR, negosiasi gaji, dan simulasi interview interaktif bersama AI Coach Lamarin.",
};

const guideCards = [
  {
    icon: "🌟",
    title: "Metode STAR",
    tag: "Jawaban Perilaku",
    desc: "Strukturkan jawabanmu dengan Situation (situasi), Task (tugasmu), Action (tindakan konkretmu), dan Result (dampak nyata + angka keberhasilan).",
  },
  {
    icon: "🎯",
    title: "Elevator Pitch Diri",
    tag: "Present-Past-Future",
    desc: "Mulai dari peranmu saat ini, sorot 1-2 pencapaian terbesar di masa lalu, lalu hubungkan dengan nilai tambah yang bisa kamu bawa ke perusahaan baru.",
  },
  {
    icon: "💼",
    title: "Seni Negosiasi Gaji",
    tag: "Gross & Benefit",
    desc: "Riset standar industri, tanyakan paket kompensasi menyeluruh (BPJS, asuransi, THR, bonus), dan berikan rentang angka fleksibel.",
  },
  {
    icon: "🤝",
    title: "Tanya Balik Pewawancara",
    tag: "Kesan Proaktif",
    desc: "Tanyakan ekspektasi 3 bulan pertama, tantangan terbesar tim, atau kultur kerja untuk menunjukkan bahwa kamu sungguh-sungguh tertarik.",
  },
];

export default function InterviewPage() {
  return (
    <>
      <PageHeader
        title="Tanya AI Interview & Tips Lolos Kerja"
        subtitle="Konsultasikan strategi wawancara, pelajari jawaban pertanyaan tersulit HRD & User, atau lakukan simulasi wawancara langsung bersama Coach Lamarin."
        tone="sky"
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Chat Interface */}
          <section aria-label="Ruang Percakapan Coach Lamarin">
            <Reveal>
              <InterviewChat />
            </Reveal>
          </section>

          {/* Sidebar Tips & Cheat Sheets */}
          <aside className="space-y-5">
            <Reveal delay={0.1}>
              <div className="card p-5 border-line bg-surface-2">
                <h3 className="font-display font-bold text-ink flex items-center gap-2 text-base">
                  <span>📖</span>
                  <span>Panduan Kilat Lolos Interview</span>
                </h3>
                <p className="mt-1 text-xs text-soft leading-relaxed">
                  Ingat prinsip-prinsip ini sebelum memasuki ruang wawancara:
                </p>

                <div className="mt-4 space-y-3">
                  {guideCards.map((g, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-surface p-3 transition-colors hover:border-lavender-strong"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <span>{g.icon}</span>
                          <span>{g.title}</span>
                        </span>
                        <span className="chip bg-sky/40 text-sky-strong text-[10px] py-0.5 px-2">
                          {g.tag}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-soft leading-relaxed">
                        {g.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="card p-5 border-line bg-mint/20 border-mint-strong/30">
                <h4 className="font-display font-bold text-sm text-mint-strong flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Tips Coach Hari Ini</span>
                </h4>
                <p className="mt-2 text-xs text-ink/90 leading-relaxed">
                  “Jangan pernah menghafal jawaban kata-demi-kata layaknya naskah drama. Pahami poin inti cerita Anda, lalu sampaikan dengan santai dan antusias seperti sedang bercerita kepada rekan kerja senior.”
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </div>
    </>
  );
}
