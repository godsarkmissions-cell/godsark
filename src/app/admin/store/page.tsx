"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { StoreItem } from "@/types";
import toast from "react-hot-toast";
import { Trash2, ShoppingBag } from "lucide-react";

export default function AdminStorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StoreItem["category"]>("bibles");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "storeItems"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoreItem))));
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!name || !image || price <= 0) {
      toast.error("Name, price, and image are required.");
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await uploadFile(image, "store/images", () => {});
      const fileUrl = digitalFile ? await uploadFile(digitalFile, "store/files", () => {}) : "";
      await addDoc(collection(db, "storeItems"), {
        name, category, price: Math.round(price * 100), currency: "INR",
        description, imageUrl, fileUrl, inStock: true, createdAt: serverTimestamp(),
      });
      toast.success("Item added to store.");
      setName(""); setPrice(0); setDescription(""); setImage(null); setDigitalFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "storeItems", id));
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink"><ShoppingBag /> Store</h1>

      <div className="mb-8 rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Add Item</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-primary/20 p-2" />
          <select value={category} onChange={(e) => setCategory(e.target.value as StoreItem["category"])} className="rounded-md border border-primary/20 p-2">
            <option value="software">Software</option>
            <option value="promise-cards">Promise Cards</option>
            <option value="bibles">Bibles</option>
            <option value="apparel">Apparel</option>
            <option value="handcrafts">Handcrafts</option>
            <option value="other">Other</option>
          </select>
          <input type="number" placeholder="Price (INR)" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-md border border-primary/20 p-2" />
          <div>
            <label className="mb-1 block text-xs text-ink/50">Product image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="w-full rounded-md border border-primary/20 p-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-ink/50">Digital file (optional — for software/e-goods)</label>
            <input type="file" onChange={(e) => setDigitalFile(e.target.files?.[0] ?? null)} className="w-full rounded-md border border-primary/20 p-2 text-sm" />
          </div>
        </div>
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-3 w-full rounded-md border border-primary/20 p-2" rows={2} />
        <button onClick={handleAdd} disabled={uploading} className="btn-primary mt-4">
          {uploading ? "Uploading..." : "Add Item"}
        </button>
      </div>

      <div className="rounded-xl border border-primary/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary/10 text-ink/50">
            <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-primary/5">
                <td className="p-3 font-medium text-ink">{i.name}</td>
                <td className="p-3 text-ink/60">{i.category}</td>
                <td className="p-3 text-ink/60">₹{(i.price / 100).toFixed(2)}</td>
                <td className="p-3 text-right"><button onClick={() => handleDelete(i.id)} className="text-red-500"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
