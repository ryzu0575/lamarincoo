import { handle } from "@/lib/api";
import { AIError, generateJson } from "@/lib/gemini";
import { AssistSchema } from "@/lib/schemas";
import { SYSTEM_BASE, sanitize, wrap } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const KINDS: Record<string, string> = {
  summary: "Tulis ringkasan profil 2-3 kalimat (di field text). Fokus pada nilai jual dan bidang keahlian.",
  experience: "Ubah catatan kasar menjadi 3-5 poin pengalaman (di field bullets) berformat aksi + dampak + angka.",
  project: "Ubah catatan kasar menjadi 2-4 poin proyek (di field bullets): apa yang dibangun, teknologi, hasil.",
  organization: "Ubah catatan menjadi deskripsi singkat 1-2 kalimat (di field text) tentang peran dan kontribusi.",
  skills: "Rapikan dan kelompokkan daftar skill menjadi poin-poin singkat (di field bullets), tanpa menambah skill baru.",
};

export async function POST(req: Request) {
  return handle(req, async () => {
    const body = await req.json().catch(() => null);
    const kind = String(body?.kind ?? "");
    if (!KINDS[kind]) throw new AIError("Jenis bantuan tidak dikenal.", 400);
    const notes = sanitize(body?.notes, 4000);
    if (notes.length < 5) throw new AIError("Tulis catatan kasar Anda terlebih dahulu.", 400);
    const context = sanitize(body?.context, 3000);

    const prompt = `${KINDS[kind]}

ATURAN: gunakan HANYA fakta dari catatan. Jangan mengarang angka, tool, atau capaian. Jika angka akan memperkuat poin tetapi tidak diberikan, tulis placeholder [angka] dan tambahkan pertanyaan di field questions. Gunakan kata kerja aksi di awal poin.

${context ? wrap("konteks", context) : ""}
${wrap("catatan", notes)}`;

    const result = await generateJson({ schema: AssistSchema, system: SYSTEM_BASE, prompt, temperature: 0.5 });
    return { result };
  });
}
