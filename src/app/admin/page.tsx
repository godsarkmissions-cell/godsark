"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ sermons: 0, live: 0, gallery: 0, donationsToday: 0 });

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "sermons"), (s) => setCounts((c) => ({ ...c, sermons: s.size }))),
      onSnapshot(query(collection(db, "liveEvents"), where("status", "==", "live")), (s) =>
        setCounts((c) => ({ ...c, live: s.size }))
      ),
      onSnapshot(collection(db, "gallery"), (s) => setCounts((c) => ({ ...c, gallery: s.size }))),
      onSnapshot(collection(db, "donations"), (s) => setCounts((c) => ({ ...c, donationsToday: s.size }))),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const cards = [
    { label: "Sermons Uploaded", value: counts.sermons },
    { label: "Live Now", value: counts.live },
    { label: "Gallery Items", value: counts.gallery },
    { label: "Total Donations Logged", value: counts.donationsToday },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Welcome{user?.email ? `, ${user.email}` : ""}</h1>
      <p className="mb-6 text-ink/60">Overview of God&apos;s Ark Missions content and activity.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-primary/10 bg-white p-5">
            <p className="text-sm text-ink/50">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
