"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-ink text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold text-accent">God&apos;s Ark Missions</h3>
          <p className="mt-2 text-sm text-white/70">
            A house of worship and outreach, carrying the gospel to every shore.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/sermons" className="hover:text-accent">Sermons</Link></li>
            <li><Link href="/live" className="hover:text-accent">Live</Link></li>
            <li><Link href="/donate" className="hover:text-accent">Donations</Link></li>
            <li><Link href="/admin/login" className="hover:text-accent">Admin Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-2 text-sm text-white/70">Fill in address / phone / email via Admin → Church Details.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} God&apos;s Ark Missions. All rights reserved.
      </div>
    </footer>
  );
}
