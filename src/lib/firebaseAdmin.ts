import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server-side only. Used to verify a caller is a signed-in admin (by
// verifying their Firebase Auth ID token and checking the `admins`
// collection) before handing out a Cloudflare R2 presigned upload URL.
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate one in Firebase Console > Project settings > " +
        "Service accounts > Generate new private key, then paste the JSON (minified, single line) into " +
        "your .env.local. See README."
    );
  }

  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount) });
}

export const adminAuth = getAuth(getAdminApp());
export const adminDb = getFirestore(getAdminApp());
