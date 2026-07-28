"use client";

import { useEffect, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LiveEvent } from "@/types";
import toast from "react-hot-toast";
import { Trash2, Radio } from "lucide-react";

export default function AdminLivePage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  useEffect(() => {
    const q = query(collection(db, "liveEvents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveEvent))));
    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!title || !embedUrl) {
      toast.error("Title and stream URL are required.");
      return;
    }
    await addDoc(collection(db, "liveEvents"), {
      title,
      description,
      embedUrl, // the HLS/RTMP-relay/YouTube-embed URL your OBS output feeds
      status: "scheduled",
      scheduledFor: scheduledFor ? new Date(scheduledFor).getTime() : null,
      createdAt: serverTimestamp(),
    });
    toast.success("Broadcast created.");
    setTitle(""); setDescription(""); setEmbedUrl(""); setScheduledFor("");
  };

  const setStatus = async (id: string, status: LiveEvent["status"]) => {
    await updateDoc(doc(db, "liveEvents", id), { status });
    toast.success(`Marked as ${status}.`);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "liveEvents", id));
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink"><Radio /> Live Broadcasts</h1>

      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Schedule / Start a Broadcast</h2>
        <p className="mb-3 text-xs text-ink/50">
          In OBS Studio, set your stream key/RTMP output to your chosen host (YouTube Live, Cloudflare
          Stream, Mux, etc.), then paste that host&apos;s playback/embed URL below.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Title (e.g. Sunday Service)" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Stream embed/HLS URL" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="rounded-md border border-primary/20 p-2" />
        </div>
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-3 w-full rounded-md border border-primary/20 p-2" rows={2} />
        <button onClick={handleCreate} className="btn-primary mt-4">Create Broadcast</button>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-primary/10 bg-white p-4">
            <div>
              <h3 className="font-semibold text-ink">{e.title}</h3>
              <p className="text-xs text-ink/50">Status: <span className="font-medium">{e.status}</span></p>
            </div>
            <div className="flex gap-2">
              {e.status !== "live" && (
                <button onClick={() => setStatus(e.id, "live")} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Go Live</button>
              )}
              {e.status === "live" && (
                <button onClick={() => setStatus(e.id, "ended")} className="rounded-md bg-gray-500 px-3 py-1.5 text-xs font-semibold text-white">End Stream</button>
              )}
              <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
