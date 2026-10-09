import Link from "next/link";
import { t } from "@/lib/i18n";

const copy = t();

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface2">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-soft sm:flex-row">
        <p>
          © {new Date().getFullYear()} {copy.brand} · {copy.footer.made}
        </p>
        <Link href="/privasi" className="font-semibold underline-offset-4 hover:underline">
          {copy.footer.privacy}
        </Link>
      </div>
    </footer>
  );
}
