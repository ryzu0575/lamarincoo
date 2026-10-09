"use client";

import { useState } from "react";
import { clearAllData } from "@/lib/storage";

export default function ClearDataButton() {
  const [done, setDone] = useState(false);
  return (
    <div>
      <button
        className="btn bg-pink text-pink-s"
        onClick={() => {
          if (confirm("Hapus semua draft CV, surat, dan riwayat review dari browser ini?")) {
            clearAllData();
            setDone(true);
          }
        }}
      >
        🗑️ Hapus semua data saya
      </button>
      {done && (
        <p role="status" className="mt-3 text-sm font-semibold text-mint-s">
          Semua data lokal telah dihapus.
        </p>
      )}
    </div>
  );
}
