import { z } from "zod";

export const PrioritySchema = z.enum(["Tinggi", "Sedang", "Rendah"]);

const IssueSchema = z.object({
  priority: PrioritySchema,
  title: z.string(),
  quote: z.string().describe("Kutipan persis dari dokumen yang bermasalah"),
  reason: z.string(),
  suggestion: z.string(),
});

const RewriteSchema = z.object({
  before: z.string(),
  after: z.string(),
  note: z.string().describe("Penjelasan singkat mengapa versi sesudah lebih baik"),
});

const ChecklistItem = z.object({
  item: z.string(),
  passed: z.boolean(),
  note: z.string(),
});

export const CVReviewSchema = z.object({
  overallScore: z.number(),
  summary: z.string(),
  subScores: z.object({
    ats: z.number(),
    structure: z.number(),
    clarity: z.number(),
    impact: z.number(),
    jobMatch: z.number(),
  }),
  jobMatchAvailable: z.boolean(),
  strengths: z.array(z.string()),
  issues: z.array(IssueSchema),
  rewrites: z.array(RewriteSchema),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  atsChecklist: z.array(ChecklistItem),
  actionSteps: z.array(z.string()),
});
export type CVReview = z.infer<typeof CVReviewSchema>;

export const LetterReviewSchema = z.object({
  overallScore: z.number(),
  summary: z.string(),
  subScores: z.object({
    structure: z.number(),
    tone: z.number(),
    grammar: z.number(),
    relevance: z.number(),
    impact: z.number(),
  }),
  strengths: z.array(z.string()),
  issues: z.array(IssueSchema),
  jobFit: z.string().describe("Analisis kesesuaian dengan lowongan"),
  toneAnalysis: z.string().describe("Analisis tone dan kesopanan"),
  grammarErrors: z.array(z.object({ original: z.string(), correction: z.string(), rule: z.string() })),
  structureChecklist: z.array(ChecklistItem),
  rewrites: z.array(RewriteSchema),
});
export type LetterReview = z.infer<typeof LetterReviewSchema>;

/** Skema CV untuk keluaran AI (tanpa id/pengaturan/foto). */
export const CVAISchema = z.object({
  personal: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    portfolio: z.string(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      start: z.string(),
      end: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({ school: z.string(), degree: z.string(), start: z.string(), end: z.string(), gpa: z.string(), notes: z.string() }),
  ),
  skills: z.object({ technical: z.array(z.string()), soft: z.array(z.string()) }),
  projects: z.array(z.object({ name: z.string(), link: z.string(), description: z.string(), bullets: z.array(z.string()) })),
  certifications: z.array(z.object({ name: z.string(), issuer: z.string(), year: z.string() })),
  organizations: z.array(
    z.object({ name: z.string(), role: z.string(), start: z.string(), end: z.string(), description: z.string() }),
  ),
  awards: z.array(z.object({ name: z.string(), issuer: z.string(), year: z.string() })),
  languages: z.array(z.object({ name: z.string(), level: z.string() })),
});
export type CVAI = z.infer<typeof CVAISchema>;

export const AssistSchema = z.object({
  text: z.string().describe("Teks hasil (mis. ringkasan profil); kosong jika tidak relevan"),
  bullets: z.array(z.string()).describe("Poin-poin hasil; kosong jika tidak relevan"),
  questions: z.array(z.string()).describe("Pertanyaan untuk pengguna jika ada data (mis. angka) yang kurang"),
});
export type AssistResult = z.infer<typeof AssistSchema>;

export const LetterSchema = z.object({
  placeDate: z.string(),
  attachment: z.string(),
  subject: z.string(),
  recipient: z.string(),
  salutation: z.string(),
  paragraphs: z.array(z.string()),
  closing: z.string(),
  name: z.string(),
});
export type Letter = z.infer<typeof LetterSchema>;

export const ParagraphSchema = z.object({ paragraph: z.string() });

export const InterviewChatSchema = z.object({
  reply: z.string().describe("Tanggapan lengkap, terstruktur, ramah, dan solutif dalam format Markdown."),
  suggestions: z.array(z.string()).max(4).describe("2 hingga 4 saran pertanyaan lanjutan yang relevan untuk diklik pengguna."),
});
export type InterviewChatResponse = z.infer<typeof InterviewChatSchema>;

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
