"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { Sermon } from "@/types";
import toast from "react-hot-toast";
import { Trash2, UploadCloud } from "lucide-react";

export default function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "sermons"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setSermons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Sermon))));
    return () => unsub();
  }, []);

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Title and video file are required.");
      return;
    }
    setUploading(true);
    try {
      const videoUrl = await uploadFile(file, "sermons", setProgress);
      await addDoc(collection(db, "sermons"), {
        title,
        speaker,
        topic,
        description,
        videoUrl,
        createdAt: serverTimestamp(),
      });
      toast.success("Sermon uploaded!");
      setTitle(""); setSpeaker(""); setTopic(""); setDescription(""); setFile(null); setProgress(0);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "sermons", id));
    toast.success("Sermon removed.");
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Sermons</h1>

      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Upload New Sermon</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="rounded-md border border-primary/20 p-2 text-sm" />
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-3 w-full rounded-md border border-primary/20 p-2"
          rows={3}
        />
        {uploading && (
          <div className="mt-3 h-2 w-full rounded-full bg-primary/10">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        <button onClick={handleUpload} disabled={uploading} className="btn-primary mt-4 gap-2">
          <UploadCloud size={16} /> {uploading ? "Uploading..." : "Upload Sermon"}
        </button>
      </div>

      <div className="rounded-xl border border-primary/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary/10 text-ink/50">
            <tr>
              <th className="p-3">Title</th><th className="p-3">Speaker</th><th className="p-3">Topic</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {sermons.map((s) => (
              <tr key={s.id} className="border-b border-primary/5">
                <td className="p-3 font-medium text-ink">{s.title}</td>
                <td className="p-3 text-ink/60">{s.speaker}</td>
                <td className="p-3 text-ink/60">{s.topic}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
