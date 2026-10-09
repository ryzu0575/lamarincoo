/**
 * Struktur i18n sederhana. Tambahkan bahasa lain (mis. `en`) dengan menyalin objek `id`
 * dan menambahkannya ke `dictionaries`, lalu ubah `DEFAULT_LOCALE` atau sambungkan ke state/route.
 */
export const dictionaries = {
  id: {
    brand: "Lamarin",
    nav: { review: "Review CV", builder: "Buat CV", letter: "Surat Lamaran", tips: "Tips" },
    footer: { made: "Dibuat oleh RYO", privacy: "Privasi" },
    disclaimer:
      "Hasil AI adalah masukan, bukan jaminan lolos seleksi. Selalu periksa kembali sebelum mengirim lamaran.",
    status: {
      reading: "Membaca dokumen…",
      analyzing: "Menganalisis…",
      composing: "Menyusun saran…",
    },
  },
} as const;

export type Locale = keyof typeof dictionaries;
export const DEFAULT_LOCALE: Locale = "id";
export const t = (locale: Locale = DEFAULT_LOCALE) => dictionaries[locale];
