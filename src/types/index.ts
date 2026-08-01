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

export interface PollOption {
  id: string;
  text: string;
}

export interface AnnouncementPoll {
  question: string;
  options: PollOption[];
}

export interface AnnouncementPost {
  id: string;
  text: string;
  imageUrls: string[];      // uploaded photo(s), YouTube-community-post style
  gifUrl?: string;          // uploaded/linked GIF (rendered as an animated image)
  poll?: AnnouncementPoll;
  pinned: boolean;
  authorName: string;
  createdAt: number;        // epoch ms
}

// One doc per device under announcements/{id}/votes/{deviceId}
export interface AnnouncementVote {
  optionId: string;
  votedAt: number;
}

// --- Ahimas (newsletter / blog) -------------------------------------------
// An article is written as an ordered list of blocks so the admin can
// interleave paragraphs and images while typing, e.g. [text, image, text].
export interface AhimasBlock {
  id: string;
  type: "paragraph" | "image";
  text?: string;       // present when type === "paragraph"
  imageUrl?: string;   // present when type === "image"
  caption?: string;    // optional caption shown under an image block
}

export interface AhimasPost {
  id: string;
  title: string;
  author: string;
  date: number;          // epoch ms - editorial "published" date, admin-set
  coverImageUrl?: string;
  blocks: AhimasBlock[];
  createdAt: number;     // epoch ms
  updatedAt?: number;
}

// --- Prayer Requests --------------------------------------------------------
export interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  request: string;
  status: "new" | "praying" | "answered";
  createdAt: number;     // epoch ms
}