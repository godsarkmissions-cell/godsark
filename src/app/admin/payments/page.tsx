"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Donation } from "@/types";
import { format } from "date-fns";
import { Wallet } from "lucide-react";

export default function AdminPaymentsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setDonations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation))));
    return () => unsub();
  }, []);

  const total = donations.filter((d) => d.status === "success").reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink"><Wallet /> Payments</h1>

      <div className="mb-6 rounded-xl border border-primary/10 bg-white p-6">
        <p className="text-sm text-ink/50">Total received (successful)</p>
        <p className="text-3xl font-bold text-primary">₹{(total / 100).toLocaleString("en-IN")}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-primary/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary/10 text-ink/50">
            <tr>
              <th className="p-3">Date</th><th className="p-3">Donor</th><th className="p-3">Purpose</th>
              <th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Payment ID</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((d) => (
              <tr key={d.id} className="border-b border-primary/5">
                <td className="p-3 text-ink/60">
                  {d.createdAt
                    ? format(
                        // Firestore serverTimestamp() resolves to a Timestamp object with .toDate()
                        typeof d.createdAt === "object" && "toDate" in (d.createdAt as any)
                          ? (d.createdAt as any).toDate()
                          : new Date(d.createdAt as number),
                        "PPp"
                      )
                    : "—"}
                </td>
                <td className="p-3 font-medium text-ink">{d.donorName}<br /><span className="text-xs text-ink/40">{d.donorEmail}</span></td>
                <td className="p-3 text-ink/60">{d.purpose}</td>
                <td className="p-3 text-ink/60">₹{(d.amount / 100).toFixed(2)}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    d.status === "success" ? "bg-green-100 text-green-700" :
                    d.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>{d.status}</span>
                </td>
                <td className="p-3 text-xs text-ink/40">{d.paymentId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {donations.length === 0 && <p className="p-6 text-center text-ink/50">No donations recorded yet.</p>}
      </div>
    </div>
  );
}
