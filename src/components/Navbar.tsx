"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/sermons", label: "Sermons" },
  { href: "/live", label: "Live" },
  { href: "/store", label: "Store" },
  { href: "/scriptures", label: "Scriptures" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null; // admin has its own shell

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="God's Ark Missions" width={40} height={40} className="rounded-full" />
          <span className="hidden text-lg font-bold text-ink sm:block">God&apos;s Ark Missions</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                pathname === tab.href
                  ? "bg-primary text-white"
                  : "text-ink hover:bg-primary/10 hover:text-primary"
              )}
            >
              {tab.label}
            </Link>
          ))}
          <Link href="/donate" className="btn-accent ml-2 !px-4 !py-2 text-sm">
            Donate
          </Link>
          <Link
            href="/admin/login"
            title="Admin Login"
            className="ml-2 flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-primary/10 hover:text-primary"
          >
            <ShieldCheck size={16} /> Admin
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="text-ink" /> : <Menu className="text-ink" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-primary/10 bg-white p-4 md:hidden">
          {[...TABS, { href: "/donate", label: "Donate" }, { href: "/admin/login", label: "Admin Login" }].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium",
                pathname === tab.href ? "bg-primary text-white" : "text-ink hover:bg-primary/10"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}