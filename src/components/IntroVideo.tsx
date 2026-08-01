"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen intro video shown every time the site loads.
 * Automatically hides itself and reveals the main site once the video ends.
 * No skip button — visitors watch the full intro every visit.
 * Body scroll is locked (no side scrollbar) while the intro is playing.
 */
export default function IntroVideo() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showIntro) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showIntro]);

  if (!showIntro) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
      <video
        className="h-full w-full object-cover"
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={() => setShowIntro(false)}
      />
    </div>
  );
}