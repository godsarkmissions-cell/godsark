"use client";

import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { LiveTvScheduleItem } from "@/types";
import toast from "react-hot-toast";
import { Trash2, Tv } from "lucide-react";
import { format } from "date-fns";

export default function AdminLiveTvPage() {
  const [items, setItems] = useState<LiveTvScheduleItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "liveTvSchedule"), orderBy("startTime", "asc"));
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveTvScheduleItem)))
    );
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!title || !file || !start || !end) {
      toast.error("Title, video file, start and end time are required.");
      return;
    }
    setUploading(true);
    try {
      const videoUrl = await uploadFile(file, "livetv", () => {});
      await addDoc(collection(db, "liveTvSchedule"), {
        title,
        videoUrl,
        startTime: new Date(start).getTime(),
        endTime: new Date(end).getTime(),
        order: items.length,
        createdAt: serverTimestamp(),
      });
      toast.success("Added to 24/7 schedule.");
      setTitle(""); setFile(null); setStart(""); setEnd("");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "liveTvSchedule", id));
  };

  return (
    <div>
      <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-ink"><Tv /> 24/7 Live TV Schedule</h1>
      <p className="mb-6 text-sm text-ink/60">
        Every visitor sees a floating player (bottom-right corner) that automatically plays whichever
        item&apos;s time window is active right now. Queue up back-to-back items to keep it running
        continuously.
      </p>

      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Add Scheduled Item</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="rounded-md border border-primary/20 p-2 text-sm" />
          <div>
            <label className="mb-1 block text-xs text-ink/50">Start</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded-md border border-primary/20 p-2" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-ink/50">End</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded-md border border-primary/20 p-2" />
          </div>
        </div>
        <button onClick={handleAdd} disabled={uploading} className="btn-primary mt-4">
          {uploading ? "Uploading..." : "Add to Schedule"}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-lg border border-primary/10 bg-white p-4">
            <div>
              <h3 className="font-semibold text-ink">{i.title}</h3>
              <p className="text-xs text-ink/50">
                {format(new Date(i.startTime), "PPp")} → {format(new Date(i.endTime), "PPp")}
              </p>
            </div>
            <button onClick={() => handleDelete(i.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink/40">
        Prefer a true continuous broadcast instead of a playlist? Point <code>NEXT_PUBLIC_LIVE_TV_HLS_URL</code> in
        your .env.local at a 24/7 HLS restream (e.g. via Cloudflare Stream Live or a looping OBS→RTMP relay) — the
        widget falls back to it automatically whenever nothing here is scheduled.
      </p>
    </div>
  );
}
