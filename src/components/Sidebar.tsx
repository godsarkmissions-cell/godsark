"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  X,
  Megaphone,
  Home as HomeIcon,
  Video,
  Radio,
  ShoppingBag,
  BookOpen,
  Images,
  Info,
  Newspaper,
  HandHeart,
} from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/ahimas", label: "Ahimas", icon: Newspaper },
  { href: "/sermons", label: "Sermons", icon: Video },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/store", label: "Store", icon: ShoppingBag },
  { href: "/scriptures", label: "Scriptures", icon: BookOpen },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/prayer-requests", label: "Prayer Requests", icon: HandHeart },
  { href: "/about", label: "About", icon: Info },
];

const LAST_SEEN_KEY = "ga_announcements_last_seen";

export default function Sidebar() {
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

  // Close the drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape for keyboard users
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname?.startsWith("/admin")) return null; // admin has its own shell

  return (
    <>
      {/* Brand (logo + name) and the menu trigger, flush against the top-left
          corner of the page at the same height as the navbar's white bar
          (h-14) so the two merge into a single seamless white header instead
          of floating as a separate inset card with a visible gap around it. */}
      <div className="fixed left-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-primary/10 bg-white/95 pl-4 pr-3 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-90">
          <span className="brand-logo-glow relative flex items-center justify-center">
            <Image src="/logo.png" alt="God's Ark Missions" width={36} height={36} className="rounded-full" />
          </span>
          <span className="hidden whitespace-nowrap text-sm font-bold text-ink sm:inline sm:text-base">God&apos;s Ark Missions</span>
        </Link>

        <button
          className="menu-trigger flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/5 transition hover:bg-primary/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={clsx("menu-trigger-icon", open && "is-open")}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Dim backdrop behind the drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Spacer + close button — reserves enough height to clear the fixed
            brand card above, so "Home" never sits underneath it */}
        <div className="flex h-20 shrink-0 items-center justify-end border-b border-primary/10 px-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-primary/10 hover:text-primary"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "sidebar-tab group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "is-active bg-primary text-white" : "text-ink/70 hover:bg-primary/10 hover:text-primary"
                )}
              >
                <span className="relative flex items-center">
                  <Icon size={18} />
                  {tab.label === "Announcements" && hasUnread && (
                    <span className="notify-dot absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Donate, pinned at the bottom */}
        <div className="border-t border-primary/10 p-3">
          <Link
            href="/donate"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-dark hover:text-white"
          >
            <HandHeart size={18} />
            Donate
          </Link>
        </div>
      </aside>
    </>
  );
}