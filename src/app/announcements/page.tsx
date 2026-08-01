"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AnnouncementPost } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Megaphone, Pin, X } from "lucide-react";
import PollWidget from "@/components/PollWidget";

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<AnnouncementPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const raw = snap.docs.map((d) => {
        const data = d.data() as Omit<AnnouncementPost, "id" | "createdAt"> & {
          createdAt?: { toMillis?: () => number } | number;
        };
        const createdAt =
          typeof data.createdAt === "number" ? data.createdAt : data.createdAt?.toMillis?.() ?? Date.now();
        return { id: d.id, ...data, createdAt } as AnnouncementPost;
      });
      // Pinned posts float to the top; everything else stays newest-first.
      raw.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);
      setPosts(raw);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Megaphone size={22} />
        </span>
        <div>
          <h1 className="section-title !mb-0">Announcements</h1>
          <p className="text-sm text-ink/60">Updates, news & polls from God&apos;s Ark Missions.</p>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-primary/5" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-primary/20 p-12 text-center text-ink/50">
          No announcements yet. Check back soon!
        </div>
      )}

      <div className="space-y-5">
        {posts.map((post, i) => (
          <article
            key={post.id}
            className="animate-fade-in-up rounded-xl border border-primary/10 bg-white p-5 shadow-sm transition hover:shadow-md"
            style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
          >
            <div className="mb-3 flex items-center gap-3">
              <Image src="/logo.png" alt="God's Ark Missions" width={40} height={40} className="rounded-full" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-ink">{post.authorName || "God's Ark Missions"}</p>
                  {post.pinned && (
                    <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink/50">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>

            {post.text && (
              <p className="mb-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{post.text}</p>
            )}

            {post.imageUrls?.length > 0 && (
              <div
                className={`mb-3 grid gap-1 overflow-hidden rounded-xl ${
                  post.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {post.imageUrls.slice(0, 4).map((url, idx) => (
                  <button
                    key={url}
                    onClick={() => setLightbox(url)}
                    className="group relative block aspect-video overflow-hidden bg-primary/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {idx === 3 && post.imageUrls.length > 4 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                        +{post.imageUrls.length - 4}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {post.gifUrl && (
              <button
                onClick={() => setLightbox(post.gifUrl!)}
                className="group relative mb-3 block w-full overflow-hidden rounded-xl bg-primary/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.gifUrl}
                  alt="GIF"
                  className="max-h-96 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                  GIF
                </span>
              </button>
            )}

            {post.poll && <PollWidget postId={post.id} poll={post.poll} />}
          </article>
        ))}
      </div>

      {lightbox && (
        <div
          className="animate-pop-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-5 top-5 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}