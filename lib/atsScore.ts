import type { CVData } from "./types";

export interface AtsCheck {
  label: string;
  passed: boolean;
  weight: number;
  tip: string;
}

const dateKind = (s: string) => {
  const v = s.trim();
  if (!v) return "";
  if (/^(sekarang|present|saat ini)$/i.test(v)) return "now";
  if (/^[A-Za-z]{3,9}\.? \d{4}$/.test(v)) return "mon-yyyy";
  if (/^\d{1,2}\/\d{4}$/.test(v)) return "mm/yyyy";
  if (/^\d{4}$/.test(v)) return "yyyy";
  return "other";
};

/** Skor ATS sederhana berbasis aturan lokal (tanpa AI). */
export function atsScore(cv: CVData) {
  const bullets = [...cv.experience.flatMap((e) => e.bullets), ...cv.projects.flatMap((p) => p.bullets)].filter(Boolean);
  const withNumbers = bullets.filter((b) => /\d|\[angka\]/.test(b)).length;
  const dates = [...cv.experience.flatMap((e) => [e.start, e.end]), ...cv.education.flatMap((e) => [e.start, e.end])]
    .map(dateKind)
    .filter((k) => k && k !== "now");
  const consistent = new Set(dates).size <= 1 && !dates.includes("other");
  const words = JSON.stringify({ ...cv, personal: { ...cv.personal, photo: "" }, settings: 0 }).split(/\s+/).length;
  const p = cv.personal;

  const checks: AtsCheck[] = [
    { label: "Nama lengkap terisi", passed: !!p.name.trim(), weight: 8, tip: "Isi nama lengkap di data diri." },
    { label: "Email & telepon terisi", passed: !!p.email.trim() && !!p.phone.trim(), weight: 10, tip: "Lengkapi email dan nomor telepon." },
    { label: "Ada LinkedIn / portofolio", passed: !!(p.linkedin.trim() || p.portfolio.trim()), weight: 4, tip: "Tambahkan tautan LinkedIn atau portofolio." },
    { label: "Ringkasan profil 200–600 karakter", passed: cv.summary.length >= 200 && cv.summary.length <= 600, weight: 10, tip: "Tulis ringkasan 2–3 kalimat yang padat." },
    { label: "Ada pengalaman kerja atau proyek", passed: cv.experience.length > 0 || cv.projects.length > 0, weight: 12, tip: "Tambahkan minimal satu pengalaman atau proyek." },
    { label: "Ada pendidikan", passed: cv.education.length > 0, weight: 8, tip: "Tambahkan riwayat pendidikan." },
    { label: "Minimal 5 skill", passed: cv.skills.technical.length + cv.skills.soft.length >= 5, weight: 10, tip: "Cantumkan minimal 5 skill relevan." },
    { label: "≥ 40% poin memuat angka/capaian terukur", passed: bullets.length > 0 && withNumbers / bullets.length >= 0.4, weight: 12, tip: "Tambahkan angka (persentase, jumlah, waktu) pada poin." },
    { label: "Format tanggal konsisten", passed: dates.length === 0 ? false : consistent, weight: 8, tip: "Gunakan satu format, mis. “Jan 2022”." },
    { label: "Tanpa foto (lebih aman untuk ATS)", passed: !(cv.settings.showPhoto && cv.settings.template !== "ats" && !!cv.personal.photo), weight: 6, tip: "Foto bisa mengganggu sebagian sistem ATS." },
    { label: "Panjang wajar (±250–900 kata)", passed: words >= 250 && words <= 900, weight: 6, tip: "Targetkan 1–2 halaman." },
    { label: "Heading standar & satu kolom", passed: true, weight: 6, tip: "Semua template Lamarin sudah satu kolom dengan heading standar." },
  ];
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const got = checks.filter((c) => c.passed).reduce((a, c) => a + c.weight, 0);
  return { score: Math.round((got / total) * 100), checks };
}
