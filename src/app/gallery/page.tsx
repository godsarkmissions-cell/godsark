"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GalleryItem } from "@/types";
import Image from "next/image";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem)))
    );
    return () => unsub();
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="section-title">Gallery</h1>
      <p className="mb-8 text-ink/60">Photos and videos from our services, outreach, and events.</p>

      {items.length === 0 ? (
        <p className="text-ink/50">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setLightbox(item)}
              className="relative aspect-square overflow-hidden rounded-lg bg-primary/5"
            >
              <Image
                src={item.thumbnailUrl || item.url}
                alt={item.eventName}
                fill
                className="object-cover transition hover:scale-105"
              />
              {item.type === "video" && (
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  VIDEO
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-h-[85vh] max-w-3xl">
            {lightbox.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.url} alt={lightbox.eventName} className="max-h-[85vh] rounded-lg" />
            ) : (
              <video src={lightbox.url} controls autoPlay className="max-h-[85vh] rounded-lg" />
            )}
            <p className="mt-2 text-center text-white">{lightbox.eventName}</p>
          </div>
        </div>
      )}
    </div>
  );
}
