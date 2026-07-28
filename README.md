# God's Ark Missions — Website

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Firebase.

Theme colors are pulled straight from your logo:
- Primary blue `#027DB8`, light blue `#219ACF`
- Accent orange `#FEA104`
- Ink navy `#0B1E33`

## Pages
`/` Home · `/sermons` · `/live` · `/store` · `/scriptures` · `/gallery` · `/about` · `/donate`
Admin: `/admin/login`, `/admin` (dashboard), `/admin/sermons`, `/admin/live`, `/admin/livetv`,
`/admin/gallery`, `/admin/store`, `/admin/church-details`, `/admin/payments`.

A floating **24/7 Live TV** player sits bottom-right on every public page (not on `/admin`).

---

## 1. Install prerequisites

- Node.js 18.18+ (LTS recommended) — https://nodejs.org
- A Firebase account — https://console.firebase.google.com
- (Optional, for donations) A Razorpay account — https://razorpay.com — swap for Stripe if you prefer

## 2. Install project dependencies

```bash
cd godsark-website
npm install
npm install razorpay        # used by the /api/create-order route
```

Libraries this project uses (already in `package.json`):
- `next`, `react`, `react-dom` — framework
- `typescript` — types
- `tailwindcss`, `postcss`, `autoprefixer` — styling
- `firebase` — Auth, Firestore, Storage (client SDK)
- `react-firebase-hooks` — convenience hooks (optional, included for future use)
- `react-player` — plays sermon/live video from any URL (Firebase Storage, YouTube, etc.)
- `hls.js` — plays `.m3u8` live streams in the 24/7 TV widget
- `react-hot-toast` — toast notifications in the admin panel
- `date-fns` — date formatting
- `lucide-react` — icons
- `clsx` — conditional classNames
- `razorpay` (server-only) — creates payment orders for the Donate page

## 3. Create your Firebase project

1. Go to the Firebase Console → **Add project** → name it (e.g. `godsark-missions`).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** → start in **production mode**.
4. **Build → Storage → Get started** → keep default bucket.
5. **Project settings (gear icon) → General → Your apps → Web (</>) → register app.**
   Copy the `firebaseConfig` values into `.env.local` (see step 4).

## 4. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

NEXT_PUBLIC_LIVE_TV_HLS_URL=          # optional fallback stream, see section 8
NEXT_PUBLIC_SUNDAY_LIVE_EMBED_URL=    # optional convenience var if you want a fixed URL
```

## 5. Deploy security rules

Install the Firebase CLI once:
```bash
npm install -g firebase-tools
firebase login
firebase init      # choose Firestore + Storage, point at this project, keep existing files
firebase deploy --only firestore:rules,storage:rules
```
This project already ships `firestore.rules` and `storage.rules` — they make all
content **publicly readable** (so the site works without login) and **writable only
by admins** (so random visitors can't upload).

## 6. Create your first admin user

Admin access is gated in two layers:
1. A Firebase Auth account (email/password) — proves *identity*.
2. A matching document in Firestore collection `admins/{uid}` — proves *permission*.

Steps:
1. Firebase Console → Authentication → Users → **Add user** → enter your email/password.
2. Copy the generated **User UID**.
3. Firebase Console → Firestore Database → **Start collection** → collection ID `admins`
   → **Document ID** = paste the UID → add any field, e.g. `role: "super-admin"` → Save.
4. Go to `/admin/login` on your running site and sign in with that email/password.

Repeat step 1–3 for each additional admin/editor.

## 7. Run it

```bash
npm run dev
```
Visit `http://localhost:3000`. Admin panel at `http://localhost:3000/admin/login`.

## 8. Wiring up live streaming (OBS Studio)

- **Sunday service / special lives** (`/admin/live`): In OBS, set your stream output
  (Settings → Stream) to a host that gives you a playable embed/HLS URL afterward —
  e.g. YouTube Live (unlisted), Cloudflare Stream Live, or Mux. Start streaming in OBS,
  then in `/admin/live` click **Create Broadcast**, paste that URL, and hit **Go Live**.
  It instantly appears on the public `/live` page.
- **24/7 Live TV** (`/admin/livetv`): Either (a) upload pre-recorded videos with
  start/end times to build a rolling playlist — the widget auto-plays whatever is
  "on air" right now — or (b) run a continuous OBS→RTMP relay into a 24/7 HLS
  channel and put its `.m3u8` URL in `NEXT_PUBLIC_LIVE_TV_HLS_URL` as the fallback
  for whenever the playlist has a gap.

## 9. Wiring up payments (Donate page + Store)

The scaffold uses **Razorpay** (popular for Indian churches; swap for Stripe if your
donors are mostly international — the pattern is the same: create an order/session
server-side, confirm client-side, log it to Firestore).

1. Razorpay Dashboard → Settings → API Keys → generate Key ID + Key Secret.
2. Put them in `.env.local` as shown above.
3. `/api/create-order` (already included) creates the order server-side so the
   secret key never reaches the browser.
4. Successful payments are written to Firestore `donations/{id}` and show up
   live in `/admin/payments`.
5. The **Store** page's "Buy" button is stubbed with a toast — wire it to the same
   `/api/create-order` + Razorpay checkout pattern used on `/donate` once you're
   ready to sell products (see `src/app/donate/page.tsx` for the full example).

## 10. Deployment

Easiest path: **Vercel** (made by the Next.js team).
```bash
npm install -g vercel
vercel
```
Add the same environment variables from `.env.local` in the Vercel project settings
(Project → Settings → Environment Variables), then redeploy.

Also add your production domain to Firebase Console → Authentication → Settings →
**Authorized domains**, or admin login will fail on the live site.

## 11. Project structure

```
src/
  app/                    Pages (App Router) — one folder per route
    admin/                Admin panel (protected)
    api/create-order/     Razorpay order creation (server-side)
  components/             Navbar, Footer, LiveTVWidget, ProtectedRoute
  context/AuthContext.tsx Firebase auth + admin-role state
  lib/firebase.ts         Firebase client init
  lib/upload.ts           Firebase Storage upload helper
  types/index.ts          Shared TypeScript interfaces (Firestore doc shapes)
firestore.rules           Security rules
storage.rules             Security rules
```

## 12. What's a scaffold vs. production-ready

Everything above is fully wired to Firebase (Auth, Firestore, Storage) and will
run end-to-end once you complete steps 3–6. Two things to finish for a real launch:
- Add server-side **signature verification** for Razorpay payments (currently the
  success handler trusts the client callback — fine for a demo, but for real money
  verify `razorpay_signature` in a webhook or a second API route before marking a
  donation `"success"`).
- Add pagination/infinite-scroll on Sermons/Gallery once content volume grows past
  a few dozen items (currently loads the full collection).
"# godsark" 
