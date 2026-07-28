"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LiveEvent } from "@/types";
import ReactPlayer from "react-player";
import { format } from "date-fns";
import { Radio } from "lucide-react";

export default function LivePage() {
  const [liveNow, setLiveNow] = useState<LiveEvent[]>([]);
  const [upcoming, setUpcoming] = useState<LiveEvent[]>([]);

  useEffect(() => {
    const qLive = query(collection(db, "liveEvents"), where("status", "==", "live"));
    const qAll = query(collection(db, "liveEvents"), orderBy("scheduledFor", "asc"));
    const unsub1 = onSnapshot(qLive, (snap) =>
      setLiveNow(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveEvent)))
    );
    const unsub2 = onSnapshot(qAll, (snap) =>
      setUpcoming(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as LiveEvent))
          .filter((e) => e.status === "scheduled")
      )
    );
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="section-title flex items-center gap-2">
        <Radio className="text-accent" /> Live
      </h1>
      <p className="mb-8 text-ink/60">
        Sunday services and special broadcasts, streamed directly from OBS Studio.
      </p>

      {liveNow.length > 0 ? (
        liveNow.map((e) => (
          <div key={e.id} className="mb-8 overflow-hidden rounded-xl border-2 border-accent bg-black">
            <div className="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-bold text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" /> LIVE NOW
            </div>
            <div className="aspect-video">
              <ReactPlayer url={e.embedUrl} playing controls width="100%" height="100%" />
            </div>
            <div className="bg-white p-4">
              <h2 className="font-bold text-ink">{e.title}</h2>
              <p className="text-sm text-ink/60">{e.description}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="mb-10 rounded-xl border border-primary/10 bg-primary/5 p-8 text-center text-ink/60">
          No live broadcast right now. Check the schedule below or catch our{" "}
          <a href="/sermons" className="text-primary underline">past sermons</a>.
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold text-ink">Upcoming</h2>
      <div className="space-y-3">
        {upcoming.length === 0 && <p className="text-ink/50">Nothing scheduled yet.</p>}
        {upcoming.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-primary/10 p-4">
            <div>
              <h3 className="font-semibold text-ink">{e.title}</h3>
              <p className="text-sm text-ink/60">{e.description}</p>
            </div>
            {e.scheduledFor && (
              <span className="text-sm font-medium text-primary">
                {format(new Date(e.scheduledFor), "PPp")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
