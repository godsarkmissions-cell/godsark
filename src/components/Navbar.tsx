"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Tv } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null; // admin has its own shell

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-1.5 border-b border-primary/10 bg-white/95 px-2 backdrop-blur sm:gap-2 sm:px-4">
      <Link
        href="/live-tv"
        className="live-badge-glow group relative flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5 text-sm font-semibold text-white transition sm:px-3"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="live-dot-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <Tv size={15} className="shrink-0" />
        <span className="hidden sm:inline">24/7 Live</span>
      </Link>

      <Link
        href="/admin/login"
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-ink/60 transition hover:bg-primary/10 hover:text-primary sm:px-3"
      >
        <ShieldCheck size={16} className="shrink-0" />
        <span className="hidden sm:inline">Admin</span>
      </Link>
    </header>
  );
}