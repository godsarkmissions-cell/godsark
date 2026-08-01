"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck, Megaphone } from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/sermons", label: "Sermons" },
  { href: "/live", label: "Live" },
  { href: "/store", label: "Store" },
  { href: "/scriptures", label: "Scriptures" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

const LAST_SEEN_KEY = "ga_announcements_last_seen";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Watch the newest announcement so the tab can show a small "new" dot,
  // similar to YouTube's community-post notification behavior.
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) return;
      const latest = snap.docs[0].data() as { createdAt?: { toMillis?: () => number } | number };
      const createdAtMs =
        typeof latest.createdAt === "number"
          ? latest.createdAt
          : latest.createdAt?.toMillis?.() ?? 0;
      const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) ?? 0);
      setHasUnread(createdAtMs > lastSeen);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (pathname === "/announcements") {
      localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      setHasUnread(false);
    }
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null; // admin has its own shell

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <Image src="/logo.png" alt="God's Ark Missions" width={40} height={40} className="rounded-full" />
          <span className="hidden text-lg font-bold text-ink sm:block">God&apos;s Ark Missions</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "nav-tab flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "is-active bg-primary text-white" : "text-ink hover:bg-primary/10 hover:text-primary"
                )}
              >
                {tab.icon && (
                  <span className="relative">
                    <tab.icon size={15} />
                    {tab.label === "Announcements" && hasUnread && (
                      <span className="notify-dot absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                )}
                {tab.label}
              </Link>
            );
          })}
          <Link href="/donate" className="btn-accent ml-2 !px-4 !py-2 text-sm transition hover:scale-105">
            Donate
          </Link>
          <Link
            href="/admin/login"
            title="Admin Login"
            className="nav-tab ml-2 flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-primary/10 hover:text-primary"
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
          {[...TABS, { href: "/donate", label: "Donate" }, { href: "/admin/login", label: "Admin Login" }].map(
            (tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                  pathname === tab.href ? "bg-primary text-white" : "text-ink hover:bg-primary/10"
                )}
              >
                {"icon" in tab && tab.icon && <tab.icon size={15} />}
                {tab.label}
                {tab.label === "Announcements" && hasUnread && (
                  <span className="notify-dot ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}