"use client";

import { useState } from "react";
import Script from "next/script";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { HeartHandshake } from "lucide-react";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000]; // in rupees

export default function DonatePage() {
  const [amount, setAmount] = useState(1000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<"tithe" | "offering" | "missions" | "building-fund">("offering");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!name || !email || amount <= 0) {
      toast.error("Please fill your name, email, and a valid amount.");
      return;
    }
    setLoading(true);
    try {
      // 1) Create a Razorpay order via your own API route (server-side, uses
      //    RAZORPAY_KEY_SECRET). Scaffold this at /api/create-order — see README.
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount * 100, currency: "INR" }),
      });
      const order = await res.json();

      // 2) Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "God's Ark Missions",
        description: purpose,
        order_id: order.id,
        prefill: { name, email },
        theme: { color: "#027DB8" },
        handler: async (response: { razorpay_payment_id: string }) => {
          // 3) Record the donation in Firestore for the admin "Payments" view
          await addDoc(collection(db, "donations"), {
            donorName: name,
            donorEmail: email,
            amount: amount * 100,
            currency: "INR",
            purpose,
            paymentId: response.razorpay_payment_id,
            status: "success",
            createdAt: serverTimestamp(),
          });
          toast.success("Thank you for your generosity!");
        },
      };
      // @ts-expect-error Razorpay is loaded globally via the checkout.js script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-lg rounded-xl border border-primary/10 p-8 shadow-sm">
        <h1 className="section-title flex items-center gap-2">
          <HeartHandshake className="text-accent" /> Give
        </h1>
        <p className="mb-6 text-ink/60">Your tithes and offerings sustain the ministry and its outreach.</p>

        <label className="mb-1 block text-sm font-medium text-ink">Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as typeof purpose)}
          className="mb-4 w-full rounded-md border border-primary/20 p-2"
        >
          <option value="offering">Offering</option>
          <option value="tithe">Tithe</option>
          <option value="missions">Missions</option>
          <option value="building-fund">Building Fund</option>
        </select>

        <label className="mb-1 block text-sm font-medium text-ink">Amount (INR)</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                amount === a ? "bg-primary text-white" : "bg-primary/10 text-ink"
              }`}
            >
              ₹{a}
            </button>
          ))}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28 rounded-md border border-primary/20 p-1.5 text-sm"
          />
        </div>

        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2"
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-6 w-full rounded-md border border-primary/20 p-2"
        />

        <button onClick={handleDonate} disabled={loading} className="btn-accent w-full">
          {loading ? "Processing..." : `Give ₹${amount}`}
        </button>
      </div>
    </div>
  );
}
