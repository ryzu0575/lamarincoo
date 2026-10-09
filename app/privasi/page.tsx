import type { Metadata } from "next";
import ClearDataButton from "@/components/ClearDataButton";
import { PageHeader } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Privasi",
  description: "Bagaimana Lamarin memperlakukan data CV dan surat lamaran Anda.",
};

export default function PrivasiPage() {
  return (
    <>
      <PageHeader title="Privasi & Keamanan Data" subtitle="Singkat, jelas, dan transparan." tone="mint" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-10">
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold">File tidak disimpan di server</h2>
          <p className="mt-2 text-soft">
            File CV dan surat yang Anda unggah hanya diproses di memori untuk diekstrak teksnya dan dikirim ke layanan AI (Google Gemini)
            guna menghasilkan review. Lamarin tidak menyimpan file maupun hasilnya di server.
          </p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold">Draft tersimpan di browser Anda</h2>
          <p className="mt-2 text-soft">
            Draft CV, surat, dan riwayat review disimpan di localStorage perangkat ini saja, tanpa akun. Data tidak berpindah antar
            perangkat.
          </p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold">Kunci API aman</h2>
          <p className="mt-2 text-soft">Semua panggilan AI dilakukan dari server; API key tidak pernah dikirim ke browser.</p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold">Kontrol penuh di tangan Anda</h2>
          <p className="mb-4 mt-2 text-soft">Hapus semua draft dan riwayat yang tersimpan di browser ini.</p>
          <ClearDataButton />
        </section>
      </div>
    </>
  );
}
