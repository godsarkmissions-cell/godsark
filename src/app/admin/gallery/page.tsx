"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { GalleryItem } from "@/types";
import toast from "react-hot-toast";
import { Trash2, Images } from "lucide-react";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [eventName, setEventName] = useState("");
  const [type, setType] = useState<"photo" | "video">("photo");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem))));
    return () => unsub();
  }, []);

  const handleUpload = async () => {
    if (!file || !eventName) {
      toast.error("Event name and file are required.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFile(file, "gallery", () => {});
      await addDoc(collection(db, "gallery"), {
        type, eventName, url, createdAt: serverTimestamp(),
      });
      toast.success("Added to gallery.");
      setEventName(""); setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "gallery", id));
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink"><Images /> Gallery</h1>

      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Upload Photo / Video</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input placeholder="Event name" value={eventName} onChange={(e) => setEventName(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <select value={type} onChange={(e) => setType(e.target.value as "photo" | "video")} className="rounded-md border border-primary/20 p-2">
            <option value="photo">Photo</option>
            <option value="video">Video</option>
          </select>
          <input type="file" accept={type === "photo" ? "image/*" : "video/*"} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="rounded-md border border-primary/20 p-2 text-sm" />
        </div>
        <button onClick={handleUpload} disabled={uploading} className="btn-primary mt-4">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {items.map((i) => (
          <div key={i.id} className="group relative aspect-square overflow-hidden rounded-lg bg-primary/5">
            {i.type === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.url} alt={i.eventName} className="h-full w-full object-cover" />
            ) : (
              <video src={i.url} className="h-full w-full object-cover" />
            )}
            <button
              onClick={() => handleDelete(i.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
