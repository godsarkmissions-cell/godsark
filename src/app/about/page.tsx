"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChurchDetails } from "@/types";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function AboutPage() {
  const [details, setDetails] = useState<ChurchDetails | null>(null);

  useEffect(() => {
    // Church details live in a single Firestore doc: churchDetails/main
    const unsub = onSnapshot(doc(db, "churchDetails", "main"), (snap) => {
      if (snap.exists()) setDetails(snap.data() as ChurchDetails);
    });
    return () => unsub();
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="section-title">About Us</h1>

      {details ? (
        <>
          <p className="mb-10 max-w-3xl whitespace-pre-line text-ink/80">{details.aboutText}</p>

          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <MapPin size={16} className="text-primary" /> {details.address}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Clock size={16} className="text-primary" /> {details.serviceTimings}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Mail size={16} className="text-primary" /> {details.contactEmail}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink/70">
              <Phone size={16} className="text-primary" /> {details.contactPhone}
            </div>
          </div>

          <h2 className="mb-4 text-xl font-bold text-ink">Our Pastors</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {details.pastors?.map((p) => (
              <div key={p.id} className="rounded-xl border border-primary/10 p-4 text-center">
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-primary/10">
                  {p.photoUrl && <Image src={p.photoUrl} alt={p.name} fill className="object-cover" />}
                </div>
                <h3 className="mt-3 font-semibold text-ink">{p.name}</h3>
                <p className="text-xs font-medium text-primary">{p.role}</p>
                <p className="mt-2 text-sm text-ink/60">{p.bio}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-ink/50">Church details haven&apos;t been added yet — set them in Admin → Church Details.</p>
      )}
    </div>
  );
}
