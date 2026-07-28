"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadFile } from "@/lib/upload";
import { ChurchDetails, Pastor } from "@/types";
import toast from "react-hot-toast";
import { Church, Trash2, Plus } from "lucide-react";

const empty: ChurchDetails = {
  aboutText: "", address: "", serviceTimings: "", contactEmail: "", contactPhone: "",
  socialLinks: [], pastors: [],
};

export default function AdminChurchDetailsPage() {
  const [details, setDetails] = useState<ChurchDetails>(empty);
  const [saving, setSaving] = useState(false);
  const [newPastorPhoto, setNewPastorPhoto] = useState<File | null>(null);
  const [newPastor, setNewPastor] = useState({ name: "", role: "", bio: "" });

  useEffect(() => {
    getDoc(doc(db, "churchDetails", "main")).then((snap) => {
      if (snap.exists()) setDetails(snap.data() as ChurchDetails);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "churchDetails", "main"), details);
      toast.success("Church details saved.");
    } catch (err) {
      console.error(err);
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPastor = async () => {
    if (!newPastor.name) {
      toast.error("Pastor name is required.");
      return;
    }
    let photoUrl = "";
    if (newPastorPhoto) photoUrl = await uploadFile(newPastorPhoto, "pastors", () => {});
    const pastor: Pastor = { id: crypto.randomUUID(), ...newPastor, photoUrl };
    setDetails((d) => ({ ...d, pastors: [...(d.pastors || []), pastor] }));
    setNewPastor({ name: "", role: "", bio: "" });
    setNewPastorPhoto(null);
  };

  const removePastor = (id: string) => {
    setDetails((d) => ({ ...d, pastors: d.pastors.filter((p) => p.id !== id) }));
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink"><Church /> Church Details</h1>

      <div className="mb-6 space-y-3 rounded-xl border border-primary/10 bg-white p-6">
        <textarea placeholder="About text" value={details.aboutText} onChange={(e) => setDetails({ ...details, aboutText: e.target.value })} rows={4} className="w-full rounded-md border border-primary/20 p-2" />
        <input placeholder="Address" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} className="w-full rounded-md border border-primary/20 p-2" />
        <input placeholder="Service timings (e.g. Sundays 9 AM & 6 PM)" value={details.serviceTimings} onChange={(e) => setDetails({ ...details, serviceTimings: e.target.value })} className="w-full rounded-md border border-primary/20 p-2" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Contact email" value={details.contactEmail} onChange={(e) => setDetails({ ...details, contactEmail: e.target.value })} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Contact phone" value={details.contactPhone} onChange={(e) => setDetails({ ...details, contactPhone: e.target.value })} className="rounded-md border border-primary/20 p-2" />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Details"}
        </button>
      </div>

      <div className="rounded-xl border border-primary/10 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Pastors</h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <input placeholder="Name" value={newPastor.name} onChange={(e) => setNewPastor({ ...newPastor, name: e.target.value })} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Role" value={newPastor.role} onChange={(e) => setNewPastor({ ...newPastor, role: e.target.value })} className="rounded-md border border-primary/20 p-2" />
          <input placeholder="Short bio" value={newPastor.bio} onChange={(e) => setNewPastor({ ...newPastor, bio: e.target.value })} className="rounded-md border border-primary/20 p-2" />
          <input type="file" accept="image/*" onChange={(e) => setNewPastorPhoto(e.target.files?.[0] ?? null)} className="rounded-md border border-primary/20 p-2 text-sm" />
        </div>
        <button onClick={handleAddPastor} className="btn-accent mb-4 gap-1"><Plus size={16} /> Add Pastor</button>

        <div className="space-y-2">
          {details.pastors?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-primary/10 p-3">
              <div>
                <p className="font-medium text-ink">{p.name} <span className="text-xs text-ink/50">— {p.role}</span></p>
                <p className="text-xs text-ink/60">{p.bio}</p>
              </div>
              <button onClick={() => removePastor(p.id)} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/40">Remember to click &quot;Save Details&quot; above after adding pastors.</p>
      </div>
    </div>
  );
}
