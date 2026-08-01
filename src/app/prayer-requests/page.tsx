"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { HandHeart, Send } from "lucide-react";

export default function PrayerRequestsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !request.trim()) {
      toast.error("Please share your name, email, and your prayer request.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "prayerRequests"), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        request: request.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setRequest("");
      toast.success("Your prayer request has been received.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-lg rounded-xl border border-primary/10 p-8 shadow-sm">
        <h1 className="section-title flex items-center gap-2">
          <HandHeart className="text-accent" /> Prayer Requests
        </h1>
        <p className="mb-6 text-ink/60">
          Share what&apos;s on your heart. Our prayer team will hold your request in confidence.
        </p>

        {submitted && (
          <div className="mb-5 rounded-md bg-primary/10 p-3 text-sm text-primary">
            Thank you — your request has been sent to our prayer team.
          </div>
        )}

        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2.5 text-sm"
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2.5 text-sm"
        />
        <input
          placeholder="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2.5 text-sm"
        />
        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mb-3 w-full rounded-md border border-primary/20 p-2.5 text-sm"
        />
        <textarea
          placeholder="Your prayer request..."
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          rows={5}
          className="mb-6 w-full rounded-md border border-primary/20 p-2.5 text-sm"
        />

        <button onClick={handleSubmit} disabled={submitting} className="btn-accent w-full gap-2">
          <Send size={16} /> {submitting ? "Sending..." : "Send Request"}
        </button>
      </div>
    </div>
  );
}
