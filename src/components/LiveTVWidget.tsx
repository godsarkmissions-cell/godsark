"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LiveTvScheduleItem } from "@/types";
import { Tv, Minus, Maximize2 } from "lucide-react";

/**
 * Always-on "24/7 Live TV" corner player.
 * Admin schedules a playlist (title + videoUrl + start/end time) from
 * /admin/livetv. This widget picks whichever item's [startTime, endTime]
 * window contains "now" and plays it. When nothing is scheduled it falls
 * back to NEXT_PUBLIC_LIVE_TV_HLS_URL (a continuous stream/loop) if set.
 */
export default function LiveTVWidget() {
  const pathname = usePathname();
  const [schedule, setSchedule] = useState<LiveTvScheduleItem[]>([]);
  const [minimized, setMinimized] = useState(false);
  const [current, setCurrent] = useState<LiveTvScheduleItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const q = query(collection(db, "liveTvSchedule"), orderBy("startTime", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveTvScheduleItem)));
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

  // HLS (.m3u8) needs hls.js in every browser except Safari, which supports
  // it natively. mp4/webm files play fine with a plain <video> tag.
  useEffect(() => {
    if (!src || !src.includes(".m3u8") || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }
    let hls: import("hls.js").default | undefined;
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    });
    return () => hls?.destroy();
  }, [src]);

  if (pathname?.startsWith("/admin")) return null;
  if (!src) return null; // nothing scheduled and no fallback configured yet

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-accent bg-black shadow-2xl transition-all ${
        minimized ? "h-12 w-48" : "w-72 sm:w-80"
      }`}
    >
      <div className="flex items-center justify-between bg-ink px-3 py-1.5 text-white">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Tv size={14} className="text-accent" />
          24/7 Live TV {current ? `· ${current.title}` : ""}
        </span>
        <button onClick={() => setMinimized(!minimized)} aria-label="Toggle player size">
          {minimized ? <Maximize2 size={14} /> : <Minus size={14} />}
        </button>
      </div>
      {!minimized && (
        <video
          ref={videoRef}
          key={src}
          src={src.includes(".m3u8") ? undefined : src}
          autoPlay
          muted
          loop={!current}
          playsInline
          controls
          className="aspect-video w-full bg-black"
        />
      )}
    </div>
  );
}
