import type { Metadata } from "next";
import ReviewClient from "@/components/ReviewClient";
import { PageHeader } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Review CV",
  description: "Unggah CV (PDF/DOCX) dan dapatkan skor, kritik berprioritas, saran penulisan ulang, dan analisis kata kunci.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="Review CV" subtitle="Unggah CV Anda dan dapatkan masukan jujur dan konkret dari reviewer AI." tone="lavender" />
      <ReviewClient />
    </>
  );
}
