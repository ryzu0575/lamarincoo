import type { Metadata } from "next";
import CVBuilder from "@/components/CVBuilder";
import { PageHeader } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Buat CV ATS-friendly",
  description: "Buat CV ATS-friendly dengan 4 template, bantuan AI, preview langsung, dan ekspor PDF/DOCX.",
};

export default function Page() {
  return (
    <>
      <PageHeader title="Buat CV" subtitle="Isi langkah demi langkah, lihat hasilnya langsung, lalu unduh sebagai PDF atau DOCX." tone="mint" />
      <CVBuilder />
    </>
  );
}
