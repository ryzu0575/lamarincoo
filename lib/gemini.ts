import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export class AIError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

let client: GoogleGenAI | null = null;

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new AIError("GEMINI_API_KEY belum diatur di server. Salin .env.example menjadi .env.local lalu isi kuncinya.", 500);
  }
  if (!client) client = new GoogleGenAI({ apiKey: key });
  return client;
}

export const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.5-flash";

function mapError(e: unknown): AIError {
  if (e instanceof AIError) return e;
  const msg = e instanceof Error ? e.message : String(e);
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(msg)) {
    return new AIError("Kuota layanan AI sedang habis. Coba lagi beberapa menit lagi.", 429);
  }
  if (/503|UNAVAILABLE|high demand/i.test(msg)) {
    return new AIError("Layanan AI sedang mengalami lonjakan beban. Coba lagi dalam beberapa saat.", 503);
  }
  if (/timeout|timed out|aborted/i.test(msg)) {
    return new AIError("Proses AI terlalu lama (timeout). Coba lagi atau gunakan dokumen yang lebih singkat.", 504);
  }
  if (/API key|PERMISSION_DENIED|UNAUTHENTICATED|401|403/i.test(msg)) {
    return new AIError("API key Gemini tidak valid atau tidak punya izin.", 500);
  }
  if (/SAFETY|blocked/i.test(msg)) {
    return new AIError("Permintaan diblokir oleh filter keamanan AI. Periksa isi dokumen Anda.", 422);
  }
  return new AIError("Terjadi kesalahan pada layanan AI. Silakan coba lagi.", 502);
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

export interface FilePart {
  mimeType: string;
  base64: string;
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}

interface Options<S extends z.ZodType> {
  schema: S;
  system: string;
  prompt?: string;
  chatTurns?: ChatTurn[];
  file?: FilePart;
  temperature?: number;
  postprocess?: (v: z.infer<S>) => z.infer<S>;
}

/** Memanggil Gemini dengan structured output + validasi Zod, retry bila JSON tidak valid atau model sibuk. */
export async function generateJson<S extends z.ZodType>(opts: Options<S>): Promise<z.infer<S>> {
  const ai = getClient();
  const jsonSchema = z.toJSONSchema(opts.schema) as Record<string, unknown>;
  delete jsonSchema.$schema;

  const fallbackModels = [MODEL(), "gemini-3.5-flash", "gemini-flash-lite-latest"];

  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      let contents: Array<{ role: string; parts: Array<Record<string, unknown>> }>;

      if (opts.chatTurns && opts.chatTurns.length > 0) {
        contents = opts.chatTurns.map((turn, index) => {
          let text = turn.text;
          if (attempt > 0 && index === opts.chatTurns!.length - 1 && turn.role === "user") {
            text += "\n\nPENTING: balas HANYA dengan JSON valid sesuai skema, tanpa teks pengantar atau penutup.";
          }
          return {
            role: turn.role,
            parts: [{ text }],
          };
        });
      } else {
        const parts: Array<Record<string, unknown>> = [];
        if (opts.file) parts.push({ inlineData: { mimeType: opts.file.mimeType, data: opts.file.base64 } });
        parts.push({
          text:
            (opts.prompt ?? "") +
            (attempt > 0 ? "\n\nPENTING: balas HANYA dengan JSON valid sesuai skema, tanpa teks lain." : ""),
        });
        contents = [{ role: "user", parts }];
      }

      const currentModel = fallbackModels[attempt] || MODEL();

      const res = await withTimeout(
        ai.models.generateContent({
          model: currentModel,
          contents,
          config: {
            systemInstruction: opts.system,
            temperature: attempt === 0 ? (opts.temperature ?? 0.4) : 0.2,
            responseMimeType: "application/json",
            responseJsonSchema: jsonSchema,
          },
        }),
        75_000,
      );
      const text = res.text;
      if (!text) throw new Error("empty");
      const parsed = opts.schema.parse(JSON.parse(text));
      return opts.postprocess ? opts.postprocess(parsed) : parsed;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      const isFormat = e instanceof SyntaxError || e instanceof z.ZodError || (e instanceof Error && e.message === "empty");
      const isTransient = /503|UNAVAILABLE|high demand|404|NOT_FOUND|overloaded/i.test(msg);

      if (!isFormat && !isTransient) throw mapError(e);
      if (isTransient && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }
  console.error("AI invalid output", lastErr);
  throw new AIError("Respons AI tidak valid setelah beberapa percobaan. Silakan coba lagi.", 502);
}
