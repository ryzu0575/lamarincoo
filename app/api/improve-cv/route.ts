import { handle } from "@/lib/api";
import { generateJson } from "@/lib/gemini";
import { readDocInput } from "@/lib/docinput";
import { CVAISchema } from "@/lib/schemas";
import { SYSTEM_BASE, cvImprovePrompt } from "@/lib/prompts";
import { normalizeCV } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 90;

/** mode=improve: tulis ulang & perbaiki. mode=import: salin data apa adanya ke form. */
export async function POST(req: Request) {
  return handle(req, async () => {
    const d = await readDocInput(req, ["mode", "review"]);
    const improve = d.extra.mode !== "import";
    const base = cvImprovePrompt({
      text: d.text,
      position: d.position,
      jd: d.jd,
      hasFile: !!d.file,
      review: d.extra.review,
    });
    const prompt = improve
      ? base
      : base + "\n\nMODE IMPOR: salin data persis apa adanya tanpa menulis ulang atau memperbaiki kalimat.";
    const cv = await generateJson({
      schema: CVAISchema,
      system: SYSTEM_BASE,
      prompt,
      file: d.file,
      temperature: 0.3,
    });
    return { cv: normalizeCV(cv) };
  });
}
