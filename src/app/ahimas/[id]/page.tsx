"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AhimasPost } from "@/types";
import { ArrowLeft, User, Calendar, Newspaper } from "lucide-react";

export default function AhimasArticlePage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<AhimasPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const unsub = onSnapshot(doc(db, "ahimasPosts", params.id), (snap) => {
      setPost(snap.exists() ? ({ id: snap.id, ...snap.data() } as AhimasPost) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="mx-auto max-w-2xl animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded bg-primary/5" />
          <div className="h-48 w-full rounded-xl bg-primary/5" />
          <div className="h-4 w-full rounded bg-primary/5" />
          <div className="h-4 w-5/6 rounded bg-primary/5" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page py-16 text-center">
        <Newspaper className="mx-auto mb-3 text-primary/30" size={40} />
        <p className="text-ink/60">This article couldn&apos;t be found.</p>
        <Link href="/ahimas" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft size={14} /> Back to Ahimas
        </Link>
      </div>
    );
  }

  return (
    <article className="container-page py-10">
      <Link href="/ahimas" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft size={14} /> Back to Ahimas
      </Link>

      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{post.title}</h1>
        <div className="mt-3 flex items-center gap-4 text-sm text-ink/50">
          <span className="flex items-center gap-1">
            <User size={13} /> {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {new Date(post.date).toLocaleDateString(undefined, { dateStyle: "long" })}
          </span>
        </div>

        <div className="mt-8 space-y-6">
          {post.blocks.map((block) =>
            block.type === "paragraph" ? (
              <p key={block.id} className="whitespace-pre-wrap text-[16px] leading-relaxed text-ink">
                {block.text}
              </p>
            ) : (
              <figure key={block.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.imageUrl} alt={block.caption ?? ""} className="w-full rounded-xl object-cover" />
                {block.caption && (
                  <figcaption className="mt-2 text-center text-xs text-ink/50">{block.caption}</figcaption>
                )}
              </figure>
            )
          )}
        </div>
      </div>
    </article>
  );
}
