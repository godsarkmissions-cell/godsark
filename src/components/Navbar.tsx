"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Tv } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null; // admin has its own shell

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-2 border-b border-primary/10 bg-white/95 px-4 backdrop-blur">
      <Link
        href="/live-tv"
        className="live-badge-glow group relative flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-white transition"
      >
        <span className="relative flex h-2 w-2">
          <span className="live-dot-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <Tv size={15} />
        24/7 Live
      </Link>

      <Link
        href="/admin/login"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/60 transition hover:bg-primary/10 hover:text-primary"
      >
        <ShieldCheck size={16} />
        Admin
      </Link>
    </header>
  );
}