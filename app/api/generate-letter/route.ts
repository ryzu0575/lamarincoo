import { handle } from "@/lib/api";
import { AIError, generateJson } from "@/lib/gemini";
import { LetterSchema, ParagraphSchema } from "@/lib/schemas";
import { SYSTEM_BASE, sanitize, wrap } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const TONES: Record<string, string> = {
  klasik: "Formal klasik: baku, santun, kalimat tradisional surat resmi Indonesia.",
  modern: "Formal modern: profesional, ringkas, tetap sopan namun lebih luwes.",
  antusias: "Antusias profesional: hangat dan bersemangat, tetap profesional dan tidak berlebihan.",
};
const LENGTH: Record<string, string> = {
  singkat: "singkat (3 paragraf isi)",
  sedang: "sedang (4 paragraf isi)",
  panjang: "panjang (5 paragraf isi)",
};

export async function POST(req: Request) {
  return handle(req, async () => {
    const b = await req.json().catch(() => null);
    if (!b) throw new AIError("Permintaan tidak valid.", 400);

    // Regenerasi satu paragraf
    if (b.mode === "paragraph") {
      const out = await generateJson({
        schema: ParagraphSchema,
        system: SYSTEM_BASE,
        temperature: 0.7,
        prompt: `Tulis ulang SATU paragraf surat lamaran berikut dengan gaya berbeda namun makna dan fakta sama. Tone: ${TONES[b.tone] ?? TONES.modern}. Bahasa: ${b.language === "en" ? "Inggris" : "Indonesia"}.
${wrap("konteks", sanitize(b.context, 3000))}
${wrap("dokumen", sanitize(b.paragraph, 3000))}`,
      });
      return out;
    }

    const f = (k: string, max = 1500) => sanitize(b.form?.[k], max);
    if (!f("company") || !f("position")) throw new AIError("Isi minimal nama perusahaan dan posisi.", 400);

    const data = `Nama: ${f("name")}
Email: ${f("email")} | Telepon: ${f("phone")} | Domisili: ${f("location")}
Perusahaan tujuan: ${f("company")} | Alamat/Kota perusahaan: ${f("companyAddress")}
Posisi: ${f("position")} | Sumber lowongan: ${f("source")}
Pengalaman/keunggulan utama: ${f("strengths", 3000)}
Motivasi: ${f("motivation", 2000)}
Lampiran: ${f("attachments")}
Tanggal/kota surat: ${f("placeDate")}`;

    const letter = await generateJson({
      schema: LetterSchema,
      system: SYSTEM_BASE,
      temperature: 0.7,
      prompt: `Buat surat lamaran kerja.
Tone: ${TONES[b.tone] ?? TONES.modern}
Bahasa: ${b.language === "en" ? "Inggris (gunakan format surat bisnis Inggris)" : "Indonesia (struktur surat resmi Indonesia sesuai EYD/PUEBI)"}
Panjang: ${LENGTH[b.length] ?? LENGTH.sedang}

Struktur: placeDate (tempat, tanggal), attachment (mis. "Lampiran: 1 berkas"), subject ("Perihal: Lamaran Pekerjaan sebagai ..."), recipient (alamat tujuan, gunakan "Yth. HRD/Tim Rekrutmen ..."), salutation, paragraphs (pembuka, isi, motivasi, penutup), closing ("Hormat saya,"), name.
Gunakan HANYA fakta dari data berikut. Jangan mengarang pengalaman, angka, atau nama orang. Jika data tidak ada, kosongkan bagian itu atau gunakan placeholder [..].
${wrap("catatan", data)}`,
    });
    return { letter };
  });
}
