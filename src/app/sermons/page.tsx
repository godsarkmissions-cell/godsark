"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sermon } from "@/types";
import ReactPlayer from "react-player";

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [active, setActive] = useState<Sermon | null>(null);

  useEffect(() => {
    const q = query(collection(db, "sermons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sermon));
      setSermons(list);
      if (!active && list.length) setActive(list[0]);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="section-title">Sermons</h1>
      <p className="mb-8 text-ink/60">Messages uploaded by our ministry team, organized by topic.</p>

      {active ? (
        <div className="mb-10 overflow-hidden rounded-xl border border-primary/10 bg-black">
          <div className="aspect-video">
            <ReactPlayer url={active.videoUrl} controls width="100%" height="100%" />
          </div>
          <div className="bg-white p-4">
            <h2 className="text-xl font-bold text-ink">{active.title}</h2>
            <p className="text-sm text-ink/60">{active.speaker} · {active.topic}</p>
            <p className="mt-2 text-sm text-ink/70">{active.description}</p>
          </div>
        </div>
      ) : (
        <p className="text-ink/50">No sermons uploaded yet. Check back soon.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sermons.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className="rounded-lg border border-primary/10 p-4 text-left transition hover:border-primary hover:shadow-md"
          >
            <h3 className="font-semibold text-ink">{s.title}</h3>
            <p className="text-xs text-ink/60">{s.speaker} · {s.topic}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
