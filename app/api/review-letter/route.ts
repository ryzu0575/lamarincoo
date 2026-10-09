import { handle } from "@/lib/api";
import { generateJson } from "@/lib/gemini";
import { readDocInput } from "@/lib/docinput";
import { LetterReviewSchema, clamp } from "@/lib/schemas";
import { SYSTEM_BASE, wrap } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  return handle(req, async () => {
    const d = await readDocInput(req, ["company"]);
    const prompt = `Review surat lamaran kerja berikut.
${d.position ? `Posisi dituju: ${d.position}` : ""}
${d.extra.company ? `Perusahaan: ${d.extra.company}` : ""}
${d.jd ? wrap("lowongan", d.jd) : "Job description tidak diberikan; nilai relevansi secara umum."}
${d.file && !d.text ? "Surat terlampir sebagai file (mungkin hasil scan)." : wrap("dokumen", d.text)}

Nilai: skor 0-100 dan sub-skor (structure, tone, grammar, relevance, impact); kekuatan; masalah berprioritas dengan kutipan nyata; jobFit (kesesuaian dengan lowongan); toneAnalysis (tone & kesopanan); grammarErrors (kesalahan ejaan/tata bahasa menurut EYD/PUEBI: kata asli, perbaikan, aturan); structureChecklist untuk struktur surat resmi Indonesia (tempat/tanggal, lampiran, perihal, alamat tujuan, salam pembuka, paragraf pembuka, isi, penutup, salam penutup, nama/tanda tangan); dan 2-4 rewrite sebelum→sesudah.`;
    const review = await generateJson({
      schema: LetterReviewSchema,
      system: SYSTEM_BASE,
      prompt,
      file: d.file,
      postprocess: (r) => ({
        ...r,
        overallScore: clamp(r.overallScore),
        subScores: {
          structure: clamp(r.subScores.structure),
          tone: clamp(r.subScores.tone),
          grammar: clamp(r.subScores.grammar),
          relevance: clamp(r.subScores.relevance),
          impact: clamp(r.subScores.impact),
        },
      }),
    });
    return { review };
  });
}
