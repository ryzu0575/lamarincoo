import mammoth from "mammoth";
import { AIError } from "./gemini";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export interface ParsedDoc {
  text: string;
  /** Terisi bila PDF hasil scan (teks tidak terbaca) -> kirim langsung ke Gemini. */
  file?: { mimeType: string; base64: string };
}

export async function parseUpload(file: File): Promise<ParsedDoc> {
  if (!file || file.size === 0) throw new AIError("File kosong. Pilih file CV yang valid.", 400);
  if (file.size > MAX_FILE_BYTES) throw new AIError("Ukuran file melebihi 5 MB.", 413);

  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer());
  const head = buf.subarray(0, 5).toString("latin1");

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    if (!head.startsWith("%PDF")) throw new AIError("File PDF rusak atau bukan PDF yang valid.", 400);
    return parsePdf(buf);
  }
  if (name.endsWith(".docx")) {
    if (!head.startsWith("PK")) throw new AIError("File DOCX rusak atau bukan DOCX yang valid.", 400);
    try {
      const { value } = await mammoth.extractRawText({ buffer: buf });
      const text = value.trim();
      if (text.length < 30) throw new AIError("Dokumen DOCX tampak kosong atau tidak berisi teks.", 422);
      return { text };
    } catch (e) {
      if (e instanceof AIError) throw e;
      throw new AIError("File DOCX tidak dapat dibaca. Pastikan file tidak rusak.", 422);
    }
  }
  throw new AIError("Format tidak didukung. Gunakan PDF atau DOCX.", 415);
}

async function parsePdf(buf: Buffer): Promise<ParsedDoc> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  try {
    const res = await parser.getText();
    const text = (res.text ?? "").replace(/\n-- \d+ of \d+ --\n/g, "\n").trim();
    if (text.length >= 80) return { text };
    // PDF hasil scan / berbasis gambar -> fallback multimodal
    return { text: "", file: { mimeType: "application/pdf", base64: buf.toString("base64") } };
  } catch (e) {
    const msg = e instanceof Error ? `${e.name} ${e.message}` : String(e);
    if (/password/i.test(msg)) throw new AIError("PDF diproteksi password. Hapus proteksi lalu unggah ulang.", 422);
    throw new AIError("PDF tidak dapat dibaca. File mungkin rusak.", 422);
  } finally {
    await parser.destroy().catch(() => {});
  }
}
