import type { Metadata } from "next";
import LetterClient from "@/components/LetterClient";
import { PageHeader } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Surat Lamaran",
  description: "Review surat lamaran kerja atau buat surat baru dengan struktur resmi Indonesia dan tone pilihan Anda.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="Surat Lamaran Kerja" subtitle="Review surat yang sudah ada, atau buat yang baru dengan struktur resmi Indonesia." tone="peach" />
      <LetterClient />
    </>
  );
}
