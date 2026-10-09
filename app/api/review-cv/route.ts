import { handle } from "@/lib/api";
import { generateJson } from "@/lib/gemini";
import { readDocInput } from "@/lib/docinput";
import { CVReviewSchema, clamp } from "@/lib/schemas";
import { SYSTEM_BASE, cvReviewPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  return handle(req, async () => {
    const d = await readDocInput(req);
    const review = await generateJson({
      schema: CVReviewSchema,
      system: SYSTEM_BASE,
      prompt: cvReviewPrompt({ text: d.text, position: d.position, jd: d.jd, hasFile: !!d.file }),
      file: d.file,
      postprocess: (r) => ({
        ...r,
        overallScore: clamp(r.overallScore),
        subScores: {
          ats: clamp(r.subScores.ats),
          structure: clamp(r.subScores.structure),
          clarity: clamp(r.subScores.clarity),
          impact: clamp(r.subScores.impact),
          jobMatch: clamp(r.subScores.jobMatch),
        },
        jobMatchAvailable: !!d.jd && r.jobMatchAvailable,
      }),
    });
    return { review };
  });
}
