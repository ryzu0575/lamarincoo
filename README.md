# Lamarin

Asisten karier berbasis AI: review CV, buat CV ATS-friendly, serta review & buat surat lamaran kerja. Seluruh antarmuka dan keluaran AI dalam Bahasa Indonesia (struktur i18n di `lib/i18n.ts`).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Google Gemini (`@google/genai`) · Zod · pdf-parse · mammoth · @react-pdf/renderer · docx

## Instalasi

```bash
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
```

## Mendapatkan GEMINI_API_KEY

1. Buka <https://aistudio.google.com/apikey> dan masuk dengan akun Google.
2. Klik **Create API key**.
3. Tempel ke `.env.local`:

```
GEMINI_API_KEY=isi_kunci_anda
GEMINI_MODEL=gemini-2.5-flash
```

Kunci hanya dibaca di server (route `app/api/*`) dan tidak pernah dikirim ke browser.

## Menjalankan lokal

```bash
npm run dev     # http://localhost:3000
npm run build   # build produksi
npm run lint
```

## Deploy (Vercel)

1. Push ke GitHub, lalu **Import Project** di Vercel.
2. Tambahkan Environment Variables `GEMINI_API_KEY` dan (opsional) `GEMINI_MODEL`.
3. Deploy. Route AI memakai runtime Node.js (`maxDuration` 60–90 dtk; sesuaikan dengan paket Vercel Anda).

> Rate limiting bawaan bersifat in-memory per instance. Untuk produksi multi-instance, ganti `lib/api.ts` dengan Redis/Upstash.

## Struktur

```
app/            halaman & API route (review-cv, improve-cv, assist, review-letter, generate-letter)
components/     UI (Navbar, ReviewClient, CVBuilder, LetterClient, dst.)
lib/            gemini client, parser, skema Zod, prompt, storage, exporter, skor ATS, i18n
templates/      template CV (preview HTML & PDF) dan surat (PDF)
```

## Keamanan & privasi

- File diproses di memori dan tidak disimpan di server.
- Draft CV/surat & riwayat review disimpan di `localStorage`; halaman **Privasi** punya tombol “Hapus semua data saya”.
- Batas file 5 MB, validasi tipe + magic bytes, sanitasi input, rate limit per IP.
- System prompt memperlakukan isi CV/JD sebagai data (bukan instruksi) untuk menahan prompt injection.
- Struktur penyimpanan terpusat di `lib/storage.ts` sehingga mudah diganti database/auth nanti.

## Catatan

- PDF hasil scan (tanpa teks) dikirim langsung ke Gemini (multimodal).
- Ekspor PDF memakai font Helvetica bawaan dengan text layer asli (terbaca ATS).
- Hasil AI adalah masukan, bukan jaminan lolos seleksi.
