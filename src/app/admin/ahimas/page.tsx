"use client";

import { useEffect, useRef, useState } from "react";
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
import { AhimasBlock, AhimasPost } from "@/types";
import toast from "react-hot-toast";
import {
  Newspaper,
  Type,
  ImagePlus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Send,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

function newBlock(type: AhimasBlock["type"]): AhimasBlock {
  return { id: crypto.randomUUID(), type, text: "" };
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAhimasPage() {
  const [posts, setPosts] = useState<AhimasPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [dateStr, setDateStr] = useState(todayInputValue());
  const [blocks, setBlocks] = useState<AhimasBlock[]>([newBlock("paragraph")]);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const q = query(collection(db, "ahimasPosts"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AhimasPost)))
    );
    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setDateStr(todayInputValue());
    setBlocks([newBlock("paragraph")]);
  };

  const loadForEdit = (post: AhimasPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setAuthor(post.author);
    setDateStr(new Date(post.date).toISOString().slice(0, 10));
    setBlocks(post.blocks.length ? post.blocks : [newBlock("paragraph")]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addParagraphBlock = () => setBlocks((b) => [...b, newBlock("paragraph")]);
  const addImageBlockSlot = () => setBlocks((b) => [...b, newBlock("image")]);

  const updateBlockText = (id: string, text: string) =>
    setBlocks((b) => b.map((blk) => (blk.id === id ? { ...blk, text } : blk)));

  const updateBlockCaption = (id: string, caption: string) =>
    setBlocks((b) => b.map((blk) => (blk.id === id ? { ...blk, caption } : blk)));

  const handleImageChoose = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploadingBlockId(id);
    try {
      const url = await uploadFile(file, "ahimas/images");
      setBlocks((b) => b.map((blk) => (blk.id === id ? { ...blk, imageUrl: url } : blk)));
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed.");
    } finally {
      setUploadingBlockId(null);
    }
  };

  const removeBlock = (id: string) => setBlocks((b) => (b.length > 1 ? b.filter((blk) => blk.id !== id) : b));

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((b) => {
      const idx = b.findIndex((blk) => blk.id === id);
      const swapWith = idx + dir;
      if (idx < 0 || swapWith < 0 || swapWith >= b.length) return b;
      const copy = [...b];
      [copy[idx], copy[swapWith]] = [copy[swapWith], copy[idx]];
      return copy;
    });
  };

  const handlePublish = async () => {
    const cleanBlocks = blocks.filter(
      (b) => (b.type === "paragraph" && b.text?.trim()) || (b.type === "image" && b.imageUrl)
    );
    if (!title.trim() || !author.trim() || cleanBlocks.length === 0) {
      toast.error("Add a title, author, and at least one paragraph or image.");
      return;
    }
    if (uploadingBlockId) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        title: title.trim(),
        author: author.trim(),
        date: new Date(dateStr).getTime(),
        coverImageUrl: cleanBlocks.find((b) => b.type === "image")?.imageUrl ?? "",
        blocks: cleanBlocks,
      };

      if (editingId) {
        await updateDoc(doc(db, "ahimasPosts", editingId), { ...payload, updatedAt: serverTimestamp() });
        toast.success("Article updated!");
      } else {
        await addDoc(collection(db, "ahimasPosts"), { ...payload, createdAt: serverTimestamp() });
        toast.success("Article published!");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish article.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await deleteDoc(doc(db, "ahimasPosts", id));
    if (editingId === id) resetForm();
    toast.success("Article removed.");
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink">
        <Newspaper /> Ahimas Newsletter
      </h1>

      {/* Composer */}
      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink">{editingId ? "Edit Article" : "New Article"}</h2>
          {editingId && (
            <button onClick={resetForm} className="flex items-center gap-1 text-sm text-ink/50 hover:text-red-500">
              <X size={14} /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-primary/20 p-2.5 text-sm sm:col-span-2"
          />
          <input
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-md border border-primary/20 p-2.5 text-sm"
          />
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="rounded-md border border-primary/20 p-2.5 text-sm"
          />
        </div>

        {/* Block editor: type freely, and drop an image in at any point */}
        <div className="mt-5 space-y-3">
          <label className="text-sm font-medium text-ink/70">Content</label>
          {blocks.map((block, idx) => (
            <div key={block.id} className="rounded-lg border border-primary/10 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  {block.type === "paragraph" ? <Type size={12} /> : <ImagePlus size={12} />}
                  {block.type === "paragraph" ? "Text" : "Image"}
                </span>
                <div className="flex items-center gap-2 text-ink/40">
                  <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} aria-label="Move up" className="disabled:opacity-30 hover:text-primary">
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 1)}
                    disabled={idx === blocks.length - 1}
                    aria-label="Move down"
                    className="disabled:opacity-30 hover:text-primary"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeBlock(block.id)}
                    disabled={blocks.length <= 1}
                    aria-label="Remove block"
                    className="disabled:opacity-30 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {block.type === "paragraph" ? (
                <textarea
                  placeholder="Keep typing the article..."
                  value={block.text ?? ""}
                  onChange={(e) => updateBlockText(block.id, e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-primary/20 p-2.5 text-sm"
                />
              ) : (
                <div>
                  {block.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.imageUrl} alt="" className="mb-2 max-h-56 w-full rounded-md object-cover" />
                  ) : (
                    <button
                      onClick={() => fileInputs.current[block.id]?.click()}
                      className="mb-2 flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed border-primary/25 text-sm text-ink/50 hover:border-primary/50"
                    >
                      {uploadingBlockId === block.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" /> Uploading...
                        </span>
                      ) : (
                        "Click to choose an image"
                      )}
                    </button>
                  )}
                  <input
                    ref={(el) => {
                      fileInputs.current[block.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChoose(block.id, e.target.files?.[0])}
                  />
                  {block.imageUrl && (
                    <button
                      onClick={() => fileInputs.current[block.id]?.click()}
                      className="mb-2 text-xs font-medium text-primary hover:underline"
                    >
                      Replace image
                    </button>
                  )}
                  <input
                    placeholder="Caption (optional)"
                    value={block.caption ?? ""}
                    onChange={(e) => updateBlockCaption(block.id, e.target.value)}
                    className="w-full rounded-md border border-primary/20 p-2 text-xs"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={addParagraphBlock}
              className="flex items-center gap-1.5 rounded-md border border-primary/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-primary/10"
            >
              <Type size={13} /> Add text
            </button>
            <button
              onClick={addImageBlockSlot}
              className="flex items-center gap-1.5 rounded-md border border-primary/20 px-3 py-1.5 text-xs font-medium text-ink hover:bg-primary/10"
            >
              <ImagePlus size={13} /> Add image here
            </button>
          </div>
        </div>

        <button onClick={handlePublish} disabled={publishing} className="btn-primary mt-5 gap-2">
          <Send size={16} /> {publishing ? "Saving..." : editingId ? "Save Changes" : "Publish"}
        </button>
      </div>

      {/* Existing articles */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-start justify-between gap-4 rounded-xl border border-primary/10 bg-white p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{post.title}</p>
              <p className="mt-1 text-xs text-ink/50">
                {post.author} · {new Date(post.date).toLocaleDateString()} · {post.blocks.length} block(s)
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => loadForEdit(post)} className="text-ink/50 hover:text-primary" aria-label="Edit">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-sm text-ink/50">No articles published yet.</p>}
      </div>
    </div>
  );
}
