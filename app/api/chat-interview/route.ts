import { handle } from "@/lib/api";
import { AIError, generateJson, type ChatTurn } from "@/lib/gemini";
import { InterviewChatSchema } from "@/lib/schemas";
import { SYSTEM_INTERVIEW_COACH, sanitize } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

interface IncomingMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  return handle(req, async () => {
    const body = await req.json().catch(() => null);
    const rawMessages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    if (rawMessages.length === 0) {
      throw new AIError("Pesan tidak boleh kosong.", 400);
    }

    const targetRole = sanitize(body?.targetRole, 150);
    const mode = body?.mode === "mock" ? "mock" : "tips";

    // Ubah ke format ChatTurn Gemini dan sanitasi teks
    const chatTurns: ChatTurn[] = [];
    for (const m of rawMessages.slice(-10)) {
      const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
      const text = sanitize(m.content, 4000);
      if (text.length > 0) {
        chatTurns.push({ role, text });
      }
    }

    if (chatTurns.length === 0 || chatTurns[chatTurns.length - 1].role !== "user") {
      throw new AIError("Pesan terakhir harus dari pengguna.", 400);
    }

    let customSystem = SYSTEM_INTERVIEW_COACH;
    if (targetRole) {
      customSystem += `\n\nKONTEKS PENGGUNA: Pelamar sedang mempersiapkan diri untuk posisi/bidang: "${targetRole}". Berikan tips dan contoh yang relevan dengan posisi tersebut.`;
    }
    if (mode === "mock") {
      customSystem += `\n\nMODE AKTIF: SIMULASI WAWANCARA KERJA (MOCK INTERVIEW).
Bertindaklah sebagai pewawancara HRD/User yang profesional. Ajukan pertanyaan wawancara satu per satu. Evaluasi respons pengguna (berikan apresiasi, koreksi konstruktif, dan saran jawaban unggulan), kemudian ajukan pertanyaan selanjutnya.`;
    } else {
      customSystem += `\n\nMODE AKTIF: KONSULTASI TIPS LOLOS INTERVIEW KERJA.
Berikan tips praktis, metode STAR, strategi psikologis, contoh jawaban, atau cara negosiasi gaji sesuai pertanyaan pengguna.`;
    }

    const result = await generateJson({
      schema: InterviewChatSchema,
      system: customSystem,
      chatTurns,
      temperature: 0.5,
    });

    return result;
  });
}
