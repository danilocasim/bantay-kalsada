# Bantay Kalsada — Implementation Plan (v2)

A mobile-first **PWA** for citizens to report road issues and for agency officials to triage them. Apple-like minimal design per `design.md`. Architecture: **Firebase + Gemini + Leaflet + PWA**.

## 0. Demo mode (graceful fallback)
When `VITE_FIREBASE_*` env vars are missing, the app runs in **demo mode**: read-only screens (Home, Map, Track, Detail, Agency Dashboard, Notifications) render seeded fake reports from `src/lib/demoData.ts`. Auth + report submission still gate behind `FirebaseSetupGate`. Once Firebase is connected, the same screens read live data from Firestore via `src/lib/dataSource.ts`.

---

## 1. Design system

Per `design.md`:
- **Typography**: system font stack (`-apple-system, SF Pro Display, Inter, sans-serif`), large headings, generous line-height.
- **Palette**: near-white background (`#FAFAF9`), graphite text (`#1C1C1E`), soft surfaces, single accent (e.g. signal blue `#0A84FF`), semantic urgency colors (green/amber/red).
- **Surfaces**: rounded 2xl cards, soft shadows, hairline borders, generous whitespace.
- **Navigation**: pill-shaped floating bottom nav with icon + label.
- **Motion**: subtle spring transitions, 150–250ms.
- **Icons**: lucide-react.

Tokens go in `index.css` (HSL) and `tailwind.config.ts`. No hardcoded colors in components.

---

## 2. Screens (all 13 from the brief)

**Citizen**
1. Splash
2. Onboarding (3 slides)
3. Login / Signup (email + Google + anonymous "report without account")
4. Home — greeting, "Report an issue" CTA, AI-generated local insight card, recent reports list
5. Public Map — Leaflet map of all reports, severity-colored pins, filter by category/status
6. Report flow — camera/upload → location (auto + draggable pin) → category + description form
7. AI Analysis — animated progress while Gemini classifies image and generates summary
8. Track My Reports — list of user's reports with status chips
9. Report Detail — photos, AI summary, status timeline, confirm-button for other users
10. Profile — avatar, stats (reports filed, confirmed), settings, sign out

**Agency Official**
11. Dashboard — Leaflet heatmap + sortable queue (severity, age, category)
12. Case Detail — full report, status update controls, internal notes
13. Notifications — FCM-driven inbox of new reports / status changes

Plus: empty states, urgency badges, error states, offline banner.

---

## 3. Backend — Firebase

### Auth
Firebase Authentication with **Email/Password**, **Google**, and **Anonymous** providers.

### Firestore (NoSQL) collections
- `users/{uid}` — `{ displayName, photoURL, createdAt, reportsCount, confirmsCount }`
- `reports/{reportId}` — `{ title, description, category, severity, status, geo (GeoPoint), geohash, agencyId, reporterUid, createdAt, updatedAt, photoURLs[], aiSummary, aiCategory, aiSeverity, confirmCount }`
- `reports/{reportId}/confirmations/{uid}` — one doc per confirming user
- `reports/{reportId}/statusEvents/{eventId}` — `{ status, note, byUid, at }`
- `agencies/{agencyId}` — `{ name, jurisdictionGeohashPrefixes[], contact }`
- `fcmTokens/{uid}/tokens/{tokenId}` — for push delivery

### Roles
**Custom claims** (`role: "citizen" | "agency_official"`) set via a callable Cloud Function — never stored in user-writable docs. UI gates and Security Rules both check claims.

### Firebase Storage
`reports/{reportId}/{uuid}.jpg` — image-only, max 5 MB, authenticated uploads only.

### Cloud Functions (2nd gen, Node.js)
- `analyzeReport` (Firestore trigger on report create) — calls **Gemini** with photo + description; writes back `aiCategory`, `aiSeverity`, `aiSummary`.
- `routeAgency` (same trigger) — matches `geohash` prefix + category to an agency, sets `agencyId`.
- `onReportStatusChange` (Firestore trigger) — appends `statusEvents` doc + sends FCM push to reporter.
- `setUserRole` (callable, admin-only) — sets custom claims.
- `notifyAgencyOnNew` (Firestore trigger) — FCM to officials whose jurisdiction matches.

### Security Rules
Firestore + Storage rules: signed-in to create reports; only reporter or `agency_official` can update; everyone reads public report fields; one confirmation per user, can't confirm own report; storage uploads gated to authenticated users with image MIME + size cap.

### Composite indexes
Predeclared in `firestore.indexes.json` for queries like `(agencyId, status, severity desc)` and `(reporterUid, createdAt desc)`.

---

## 4. Maps — Leaflet + OpenStreetMap

- `react-leaflet` for Public Map, report location picker, and Agency Dashboard heatmap (`leaflet.heat`).
- `geofire-common` to compute geohashes and run radius queries against Firestore.
- No API key required.

---

## 5. PWA setup

- `manifest.json` with name, short_name, theme color, icons (192/512), `display: standalone`.
- `vite-plugin-pwa` with `devOptions.enabled = false`.
- Service worker registered **only** when not in iframe and not on a Lovable preview host (per Lovable PWA guidance). FCM service worker for push notifications.
- Install prompt component ("Add to Home Screen") on Home for eligible browsers.
- Offline shell caching for app skeleton; reports require connectivity.
- ⚠️ Note to user: PWA install + push notifications work in the **published** site, not inside the Lovable editor preview iframe.

---

## 6. AI — Gemini via Cloud Functions

`analyzeReport` Cloud Function calls Gemini directly using a `GEMINI_API_KEY` stored in Firebase Secret Manager. Returns:
- `aiCategory` (pothole, flooding, signage, lighting, debris, other)
- `aiSeverity` (low / medium / high)
- `aiSummary` (1–2 sentence official-facing summary)

`home-insight` is a callable function that summarizes recent activity in the user's area for the Home card.

---

## 7. What you'll provide after approval

I'll guide you step-by-step in chat:
1. Create a Firebase project at console.firebase.google.com
2. Enable **Blaze plan** (pay-as-you-go, required for Cloud Functions; free tier is generous)
3. Enable **Email/Password**, **Google**, and **Anonymous** auth providers
4. Paste the **web app config** (apiKey, authDomain, projectId, etc. — these are public; safe in code)
5. Generate a **VAPID key** in Cloud Messaging → Web Push certificates
6. Get a **Gemini API key** from Google AI Studio (stored as a Cloud Functions secret, never in client code)

---

## 8. Build order
1. Reset + design tokens + layout shell + pill nav + routing ✅
2. Demo data layer + dataSource adapter ✅
3. All 13 screens rendering against dataSource ✅
4. Firebase Auth wiring (Splash, Onboarding, Login/Signup)
5. Firestore live reads/writes (Report flow, Track, Detail, Agency)
6. Cloud Functions: analyzeReport + routeAgency + onReportStatusChange + notifyAgencyOnNew
7. FCM push + Notifications inbox
8. PWA manifest + install prompt + production-guarded SW ✅
9. Polish, empty states, a11y

---

## 9. Honest tradeoffs

- ✅ Best-in-class push notifications via FCM.
- ✅ You fully own the Firebase project; portable.
- ⚠️ NoSQL schema needs upfront index planning (handled in `firestore.indexes.json`).
- ⚠️ Blaze plan requires a credit card, even though usage stays in free tier for an MVP.
- ⚠️ Cloud Functions deploy is a separate step from the Lovable build — I'll provide deploy commands but you'll run them locally or via CI.
