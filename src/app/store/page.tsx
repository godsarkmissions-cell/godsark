"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StoreItem } from "@/types";
import Image from "next/image";
import toast from "react-hot-toast";

const CATEGORIES: { key: StoreItem["category"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "software", label: "Software" },
  { key: "promise-cards", label: "Promise Cards" },
  { key: "bibles", label: "Bibles" },
  { key: "apparel", label: "T-Shirts & Apparel" },
  { key: "handcrafts", label: "Handcrafts" },
];

export default function StorePage() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const q = query(collection(db, "storeItems"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoreItem)))
    );
    return () => unsub();
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  // Hook this up to Razorpay/Stripe checkout — see README "Payments" section.
  const handleBuy = (item: StoreItem) => {
    toast(`Checkout for "${item.name}" — wire up your payment gateway call here.`);
  };

  return (
    <div className="container-page py-12">
      <h1 className="section-title">Store</h1>
      <p className="mb-6 text-ink/60">Official merchandise, resources, and digital tools from the ministry.</p>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === c.key ? "bg-primary text-white" : "bg-primary/10 text-ink hover:bg-primary/20"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink/50">No items yet in this category.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-primary/10">
              <div className="relative h-40 w-full bg-primary/5">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-ink/60">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-primary">
                    {item.currency} {(item.price / 100).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!item.inStock}
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
                  >
                    {item.inStock ? "Buy" : "Out of stock"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
