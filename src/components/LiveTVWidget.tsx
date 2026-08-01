"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLiveTvCurrent } from "@/hooks/useLiveTvCurrent";
import { Tv, Minus, Maximize2 } from "lucide-react";

/**
 * Always-on "24/7 Live TV" corner player.
 * Admin schedules a playlist (title + videoUrl + start/end time) from
 * /admin/livetv. This widget picks whichever item's [startTime, endTime]
 * window contains "now" and plays it. When nothing is scheduled it falls
 * back to NEXT_PUBLIC_LIVE_TV_HLS_URL (a continuous stream/loop) if set.
 *
 * Clicking the maximize button (or the navbar's "24/7 Live" button, which
 * dispatches "open-live-tv") jumps to the dedicated full-screen /live-tv
 * page instead of just growing this corner player.
 */
export default function LiveTVWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const [minimized, setMinimized] = useState(false);
  const { current, src } = useLiveTvCurrent();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onOpenLiveTv = () => router.push("/live-tv");
    window.addEventListener("open-live-tv", onOpenLiveTv);
    return () => window.removeEventListener("open-live-tv", onOpenLiveTv);
  }, [router]);

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
  if (pathname === "/live-tv") return null; // avoid a duplicate player on the full-screen page
  if (!src) return null; // nothing scheduled and no fallback configured yet

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-accent bg-black shadow-2xl transition-all ${
        minimized ? "h-12 w-48" : "w-72 sm:w-80"
      }`}
    >
      <div className="flex items-center justify-between bg-ink px-3 py-1.5 text-white">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
          <Tv size={14} className="text-accent shrink-0" />
          <span className="notify-dot h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <span className="truncate">24/7 Live TV {current ? `· ${current.title}` : ""}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => router.push("/live-tv")}
            aria-label="Open full screen"
            title="Full screen"
          >
            <Maximize2 size={14} />
          </button>
          <button onClick={() => setMinimized(!minimized)} aria-label="Toggle player size">
            {minimized ? <Maximize2 size={14} /> : <Minus size={14} />}
          </button>
        </span>
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
