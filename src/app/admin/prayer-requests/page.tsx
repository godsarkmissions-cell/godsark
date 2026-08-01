"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PrayerRequest } from "@/types";
import toast from "react-hot-toast";
import { HandHeart, Mail, Phone, MapPin, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_STYLES: Record<PrayerRequest["status"], string> = {
  new: "bg-accent/15 text-accent-dark",
  praying: "bg-primary/15 text-primary",
  answered: "bg-green-100 text-green-700",
};

export default function AdminPrayerRequestsPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "prayerRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PrayerRequest)))
    );
    return () => unsub();
  }, []);

  const setStatus = async (id: string, status: PrayerRequest["status"]) => {
    await updateDoc(doc(db, "prayerRequests", id), { status });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prayer request? This cannot be undone.")) return;
    await deleteDoc(doc(db, "prayerRequests", id));
    toast.success("Request removed.");
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink">
        <HandHeart /> Prayer Requests
      </h1>

      <div className="space-y-3">
        {requests.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} className="rounded-xl border border-primary/10 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{r.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm text-ink/70 ${isOpen ? "" : "line-clamp-1"}`}>{r.request}</p>
                    <p className="mt-1 text-xs text-ink/45">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="mt-1 shrink-0 text-ink/40" /> : <ChevronDown size={16} className="mt-1 shrink-0 text-ink/40" />}
                </button>
                <button onClick={() => handleDelete(r.id)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t border-primary/10 pt-3 text-sm text-ink/70">
                  <p className="flex items-center gap-2">
                    <Mail size={13} /> {r.email}
                  </p>
                  {r.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={13} /> {r.phone}
                    </p>
                  )}
                  {r.address && (
                    <p className="flex items-center gap-2">
                      <MapPin size={13} /> {r.address}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    {(["new", "praying", "answered"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(r.id, s)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                          r.status === s ? "bg-primary text-white" : "bg-primary/10 text-ink hover:bg-primary/20"
                        }`}
                      >
                        Mark {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {requests.length === 0 && <p className="text-sm text-ink/50">No prayer requests yet.</p>}
      </div>
    </div>
  );
}
