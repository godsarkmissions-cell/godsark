"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-ink">
        Checking credentials...
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return <>{children}</>;
}
