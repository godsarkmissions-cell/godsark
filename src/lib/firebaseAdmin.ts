import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-side only. Used to verify a caller is a signed-in admin (by
// verifying their Firebase Auth ID token and checking the `admins`
// collection) before handing out a Cloudflare R2 presigned upload URL.
//
// IMPORTANT: everything here is lazy (called from inside a function, not at
// module top-level). If FIREBASE_SERVICE_ACCOUNT_KEY were read eagerly in a
// top-level `export const`, simply *importing* this file would throw
// whenever the env var is missing — and Next.js imports API routes during
// `next build` to collect page data, so a missing env var would crash the
// entire production build, not just the request. Deferring the check to
// first actual use means the build always succeeds; only a real request to
// the route fails (cleanly, as a 401) until the env var is configured.
let cachedApp: App | undefined;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate one in Firebase Console > Project settings > " +
        "Service accounts > Generate new private key, then paste the JSON (minified, single line) into " +
        "your .env.local (or your hosting provider's env vars). See README."
    );
  }

  const serviceAccount = JSON.parse(raw);
  cachedApp = initializeApp({ credential: cert(serviceAccount) });
  return cachedApp;
}

let cachedAuth: Auth | undefined;
let cachedDb: Firestore | undefined;

export function getAdminAuth(): Auth {
  if (!cachedAuth) cachedAuth = getAuth(getAdminApp());
  return cachedAuth;
}

export function getAdminDb(): Firestore {
  if (!cachedDb) cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
