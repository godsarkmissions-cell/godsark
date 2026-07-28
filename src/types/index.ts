export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  topic: string;
  description: string;
  videoUrl: string;       // Firebase Storage download URL (or YouTube URL)
  thumbnailUrl?: string;
  createdAt: number;      // epoch ms
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  embedUrl: string;       // OBS -> RTMP host embed/HLS URL for this specific live
  status: "scheduled" | "live" | "ended";
  scheduledFor?: number;
  createdAt: number;
}

export interface ScriptureDoc {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  createdAt: number;
}

export interface StoreItem {
  id: string;
  name: string;
  category: "software" | "promise-cards" | "bibles" | "apparel" | "handcrafts" | "other";
  price: number;          // in smallest currency unit (paise/cents) for payment gateway
  currency: string;        // "INR"
  description: string;
  imageUrl: string;
  fileUrl?: string;        // for downloadable software/e-goods
  inStock: boolean;
  createdAt: number;
}

export interface GalleryItem {
  id: string;
  type: "photo" | "video";
  eventName: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: number;
}

export interface ChurchDetails {
  aboutText: string;
  address: string;
  serviceTimings: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: { platform: string; url: string }[];
  pastors: Pastor[];
}

export interface Pastor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  purpose: "tithe" | "offering" | "missions" | "building-fund" | "other";
  paymentId: string;       // gateway transaction id
  status: "success" | "failed" | "pending";
  createdAt: number;
}

export interface LiveTvScheduleItem {
  id: string;
  title: string;
  videoUrl: string;
  startTime: number;       // epoch ms
  endTime: number;         // epoch ms
  order: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: "super-admin" | "editor";
}
