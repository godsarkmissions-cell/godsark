"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LiveTvScheduleItem } from "@/types";

/**
 * Watches /liveTvSchedule in Firestore and figures out which item (if any)
 * should be playing right now, based on its [startTime, endTime] window.
 * Shared by the corner widget and the full-screen /live-tv page so both
 * stay perfectly in sync with the admin-configured schedule.
 */
export function useLiveTvCurrent() {
  const [schedule, setSchedule] = useState<LiveTvScheduleItem[]>([]);
  const [current, setCurrent] = useState<LiveTvScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "liveTvSchedule"), orderBy("startTime", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveTvScheduleItem)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const pickCurrent = () => {
      const now = Date.now();
      const active = schedule.find((s) => now >= s.startTime && now <= s.endTime);
      setCurrent(active ?? null);
    };
    pickCurrent();
    const interval = setInterval(pickCurrent, 15000);
    return () => clearInterval(interval);
  }, [schedule]);

  const fallbackUrl = process.env.NEXT_PUBLIC_LIVE_TV_HLS_URL;
  const src = current?.videoUrl || fallbackUrl;

  // Next scheduled item after "now", useful for an "up next" hint.
  const next =
    schedule
      .filter((s) => s.startTime > Date.now())
      .sort((a, b) => a.startTime - b.startTime)[0] ?? null;

  return { schedule, current, next, src, fallbackUrl, loading };
}
