"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ProtectedRoute (wrapping /admin pages) checks the "admins" Firestore
      // collection and will bounce non-admins back here automatically.
      router.push("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/logo.png" alt="God's Ark Missions" width={56} height={56} className="rounded-full" />
          <h1 className="mt-3 text-lg font-bold text-ink">Admin Sign In</h1>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-md border border-primary/20 p-2"
          required
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
