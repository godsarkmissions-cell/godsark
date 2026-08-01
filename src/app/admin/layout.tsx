"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Video,
  Radio,
  Images,
  Church,
  Wallet,
  Tv,
  ShoppingBag,
  Megaphone,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/sermons", label: "Sermons", icon: Video },
  { href: "/admin/live", label: "Live Broadcasts", icon: Radio },
  { href: "/admin/livetv", label: "24/7 Live TV Schedule", icon: Tv },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/store", label: "Store", icon: ShoppingBag },
  { href: "/admin/church-details", label: "Church Details", icon: Church },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    // No sidebar / no auth-guard on the login screen itself
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-ink text-white md:flex">
          <div className="flex items-center gap-2 border-b border-white/10 p-5">
            <Image src="/logo.png" alt="logo" width={32} height={32} className="rounded-full" />
            <span className="font-bold">Admin Panel</span>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  pathname === item.href ? "bg-primary text-white" : "text-white/70 hover:bg-white/10"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <LogOut size={16} /> Log Out
          </button>
        </aside>
        <main className="flex-1 bg-gray-50 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}