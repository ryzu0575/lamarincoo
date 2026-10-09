import { AIError, type FilePart } from "./gemini";
import { parseUpload } from "./parser";
import { sanitize } from "./prompts";

export interface DocInput {
  text: string;
  file?: FilePart;
  position: string;
  jd: string;
  extra: Record<string, string>;
}

/** Membaca FormData: file (PDF/DOCX) atau teks tempel, plus posisi & job description. */
export async function readDocInput(req: Request, extraKeys: string[] = []): Promise<DocInput> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new AIError("Permintaan tidak valid.", 400);
  }
  const file = form.get("file");
  const pasted = sanitize(form.get("text"));
  let text = pasted;
  let filePart: FilePart | undefined;

  if (file instanceof File && file.size > 0) {
    const parsed = await parseUpload(file);
    text = sanitize(parsed.text);
    filePart = parsed.file;
  }
  if (!text && !filePart) throw new AIError("Tidak ada dokumen. Unggah file atau tempel teks terlebih dahulu.", 400);
  if (text && text.length < 30) throw new AIError("Teks terlalu pendek untuk direview.", 400);

  const extra: Record<string, string> = {};
  for (const k of extraKeys) extra[k] = sanitize(form.get(k), 4000);

  return {
    text,
    file: filePart,
    position: sanitize(form.get("position"), 200),
    jd: sanitize(form.get("jd"), 8000),
    extra,
  };
}
