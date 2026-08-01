"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AhimasPost } from "@/types";
import { Newspaper, User, Calendar } from "lucide-react";

export default function AhimasListPage() {
  const [posts, setPosts] = useState<AhimasPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "ahimasPosts"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AhimasPost)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Newspaper size={22} />
        </span>
        <div>
          <h1 className="section-title !mb-0">Ahimas</h1>
          <p className="text-sm text-ink/60">Newsletter & articles from God&apos;s Ark Missions.</p>
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-primary/5" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="rounded-xl border border-dashed border-primary/20 p-12 text-center text-ink/50">
          No articles published yet. Check back soon!
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => {
          const excerpt = post.blocks.find((b) => b.type === "paragraph" && b.text)?.text ?? "";
          return (
            <Link
              key={post.id}
              href={`/ahimas/${post.id}`}
              className="animate-fade-in-up group overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-primary/5 text-primary/30">
                  <Newspaper size={32} />
                </div>
              )}
              <div className="p-4">
                <h3 className="line-clamp-2 font-bold text-ink">{post.title}</h3>
                {excerpt && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{excerpt}</p>}
                <div className="mt-3 flex items-center gap-3 text-xs text-ink/45">
                  <span className="flex items-center gap-1">
                    <User size={11} /> {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
