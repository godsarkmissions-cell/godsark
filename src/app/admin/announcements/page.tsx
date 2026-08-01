"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { useAuth } from "@/context/AuthContext";
import { AnnouncementPost, PollOption } from "@/types";
import toast from "react-hot-toast";
import {
  Megaphone,
  Image as ImageIcon,
  Film,
  ListChecks,
  Pin,
  PinOff,
  Trash2,
  Plus,
  X,
  Send,
} from "lucide-react";

function newOption(): PollOption {
  return { id: crypto.randomUUID(), text: "" };
}

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<AnnouncementPost[]>([]);

  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [gifUrlInput, setGifUrlInput] = useState("");
  const [pinned, setPinned] = useState(false);

  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<PollOption[]>([newOption(), newOption()]);

  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AnnouncementPost)))
    );
    return () => unsub();
  }, []);

  const resetForm = () => {
    setText("");
    setImages([]);
    setGifFile(null);
    setGifUrlInput("");
    setPinned(false);
    setPollEnabled(false);
    setPollQuestion("");
    setPollOptions([newOption(), newOption()]);
  };

  const updateOptionText = (id: string, value: string) =>
    setPollOptions((opts) => opts.map((o) => (o.id === id ? { ...o, text: value } : o)));

  const addOption = () => {
    if (pollOptions.length >= 5) return;
    setPollOptions((opts) => [...opts, newOption()]);
  };

  const removeOption = (id: string) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((opts) => opts.filter((o) => o.id !== id));
  };

  const handlePublish = async () => {
    const hasPoll = pollEnabled && pollQuestion.trim() && pollOptions.filter((o) => o.text.trim()).length >= 2;

    if (!text.trim() && images.length === 0 && !gifFile && !gifUrlInput.trim() && !hasPoll) {
      toast.error("Add some text, an image, a GIF, or a poll before publishing.");
      return;
    }
    if (pollEnabled && !hasPoll) {
      toast.error("A poll needs a question and at least 2 options.");
      return;
    }

    setPublishing(true);
    try {
      const imageUrls = images.length
        ? await Promise.all(images.map((f) => uploadFile(f, "announcements/images")))
        : [];

      let gifUrl: string | undefined;
      if (gifFile) {
        gifUrl = await uploadFile(gifFile, "announcements/gifs");
      } else if (gifUrlInput.trim()) {
        gifUrl = gifUrlInput.trim();
      }

      await addDoc(collection(db, "announcements"), {
        text: text.trim(),
        imageUrls,
        ...(gifUrl ? { gifUrl } : {}),
        ...(hasPoll
          ? {
              poll: {
                question: pollQuestion.trim(),
                options: pollOptions.filter((o) => o.text.trim()).map((o) => ({ id: o.id, text: o.text.trim() })),
              },
            }
          : {}),
        pinned,
        authorName: "God's Ark Missions",
        createdBy: user?.email ?? "admin",
        createdAt: serverTimestamp(),
      });

      toast.success("Announcement published!");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish announcement.");
    } finally {
      setPublishing(false);
    }
  };

  const togglePin = async (post: AnnouncementPost) => {
    await updateDoc(doc(db, "announcements", post.id), { pinned: !post.pinned });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement? This cannot be undone.")) return;
    await deleteDoc(doc(db, "announcements", id));
    toast.success("Announcement removed.");
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink">
        <Megaphone /> Announcements
      </h1>

      {/* Composer */}
      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">New Post</h2>

        <textarea
          placeholder="Share an update with the congregation..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-md border border-primary/20 p-3 text-sm"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink/70">
              <ImageIcon size={14} /> Images (up to 6)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files ?? []).slice(0, 6))}
              className="w-full rounded-md border border-primary/20 p-2 text-sm"
            />
            {images.length > 0 && <p className="mt-1 text-xs text-ink/50">{images.length} image(s) selected</p>}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-ink/70">
              <Film size={14} /> GIF (upload or paste a link)
            </label>
            <input
              type="file"
              accept="image/gif"
              onChange={(e) => setGifFile(e.target.files?.[0] ?? null)}
              className="mb-2 w-full rounded-md border border-primary/20 p-2 text-sm"
            />
            <input
              type="url"
              placeholder="https://... .gif"
              value={gifUrlInput}
              disabled={!!gifFile}
              onChange={(e) => setGifUrlInput(e.target.value)}
              className="w-full rounded-md border border-primary/20 p-2 text-sm disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Poll builder */}
        <div className="mt-4 rounded-lg border border-primary/10 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={pollEnabled}
              onChange={(e) => setPollEnabled(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <ListChecks size={14} /> Add a poll
          </label>

          {pollEnabled && (
            <div className="mt-3 space-y-2">
              <input
                placeholder="Poll question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full rounded-md border border-primary/20 p-2 text-sm"
              />
              {pollOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    placeholder={`Option ${idx + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                    className="flex-1 rounded-md border border-primary/20 p-2 text-sm"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => removeOption(opt.id)}
                      className="text-ink/40 hover:text-red-500"
                      aria-label="Remove option"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button
                  onClick={addOption}
                  className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  <Plus size={14} /> Add option
                </button>
              )}
            </div>
          )}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          <Pin size={14} /> Pin to top
        </label>

        <button onClick={handlePublish} disabled={publishing} className="btn-primary mt-4 gap-2">
          <Send size={16} /> {publishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* Existing posts */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="rounded-xl border border-primary/10 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {post.pinned && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
                    <Pin size={10} /> Pinned
                  </span>
                )}
                {post.text && <p className="line-clamp-2 text-sm text-ink">{post.text}</p>}
                <p className="mt-1 text-xs text-ink/50">
                  {post.imageUrls?.length > 0 && `${post.imageUrls.length} image(s) · `}
                  {post.gifUrl && "GIF · "}
                  {post.poll && `Poll: "${post.poll.question}" · `}
                  {post.authorName}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => togglePin(post)}
                  title={post.pinned ? "Unpin" : "Pin"}
                  className="text-ink/50 hover:text-primary"
                >
                  {post.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                </button>
                <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-ink/50">No announcements published yet.</p>}
      </div>
    </div>
  );
}