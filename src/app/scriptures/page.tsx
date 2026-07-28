"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ScriptureDoc } from "@/types";
import { FileText, Download } from "lucide-react";

export default function ScripturesPage() {
  const [docs, setDocs] = useState<ScriptureDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, "scriptures"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScriptureDoc)))
    );
    return () => unsub();
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="section-title">Scriptures</h1>
      <p className="mb-8 text-ink/60">Preaching notes and scripture studies, available as PDF downloads.</p>

      {docs.length === 0 ? (
        <p className="text-ink/50">No documents uploaded yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="flex items-start gap-4 rounded-lg border border-primary/10 p-4">
              <FileText className="mt-1 shrink-0 text-primary" size={28} />
              <div className="flex-1">
                <h3 className="font-semibold text-ink">{d.title}</h3>
                <p className="mt-1 text-sm text-ink/60">{d.description}</p>
                <a
                  href={d.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <Download size={14} /> Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
