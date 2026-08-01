"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLiveTvCurrent } from "@/hooks/useLiveTvCurrent";
import { ArrowLeft, Tv } from "lucide-react";
import { format } from "date-fns";

export default function LiveTvPage() {
  const { current, next, src, loading } = useLiveTvCurrent();
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 bg-ink/95 px-4 py-3 text-white backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Tv size={16} className="text-accent shrink-0" />
          <span className="notify-dot h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <span className="truncate">24/7 Live TV {current ? `· ${current.title}` : ""}</span>
        </span>
        <span className="w-16" aria-hidden />
      </div>

      {/* Player */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {src ? (
          <video
            ref={videoRef}
            key={src}
            src={src.includes(".m3u8") ? undefined : src}
            autoPlay
            playsInline
            controls
            loop={!current}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="max-w-sm px-6 text-center text-white/70">
            {loading ? (
              <p>Loading schedule…</p>
            ) : (
              <>
                <Tv size={40} className="mx-auto mb-4 text-white/30" />
                <p className="mb-1 font-semibold text-white">Nothing scheduled right now</p>
                <p className="text-sm">
                  Check back soon, or browse our{" "}
                  <Link href="/sermons" className="text-accent underline">
                    past sermons
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Up next strip */}
      {next && (
        <div className="border-t border-white/10 bg-ink/95 px-4 py-2.5 text-xs text-white/70">
          <span className="font-semibold text-white/90">Up next:</span> {next.title} ·{" "}
          {format(new Date(next.startTime), "EEE, MMM d 'at' h:mm a")}
        </div>
      )}
    </div>
  );
}
