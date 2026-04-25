# Bantay Kalsada MVP Implementation Plan

This plan is based on `docs/Startup Concept.md` and the current repository state.

## 1. Goal

Ship a **working PWA MVP** that lets citizens report road hazards, lets the community track and confirm them, and lets agency/moderator users update case status with visible proof.

The implementation goal is to turn the current UI-heavy prototype into a **live Firebase-backed product** for one pilot geography.

Out of scope for this implementation phase:

- Native iOS/Android apps
- SMS, Messenger, kiosk, and hotline intake
- Full government integrations
- Production-grade biometric KYC
- Nationwide routing coverage
- Advanced predictive analytics

## 2. Success criteria

### Functional

- A signed-in user can create a report with photo, location, category, and note.
- Reports persist to Firestore and images persist to Storage.
- Public report detail pages show a real status timeline.
- Community members can confirm a report and reopen a falsely resolved case.
- Agency/moderator users can update status and resolve with proof photo.
- Identity verification exists only as a **prototype**: National ID upload + selfie capture + manual review states.

### Product

- Reporting time stays under 2 minutes on mobile.
- Public status language is simple and consistent.
- Resolution proof is required by default, with override reason auditability.
- The app remains installable and usable as a PWA.

### Engineering

- Demo mode still works when Firebase config is absent.
- Core flows are covered by unit, integration, and mobile E2E tests.
- App behavior degrades gracefully when AI, push, or network connectivity fail.

## 3. Assumptions

- The first launch is a Philippines-focused pilot in one city, district, or barangay cluster.
- Firebase project setup is already available for this repo.
- `VITE_FIREBASE_VAPID_KEY` is optional and can remain unset until web push is needed.
- Human moderation is available for routing corrections, identity review, and abuse handling.
- Identity verification is a **trust layer**, not a legal identity guarantee.
- Firestore, Storage, and Functions remain the backend architecture for MVP.

## 4. Current state (files/flows)

### Product and docs

- `docs/Startup Concept.md`
  - Strong product direction already exists.
  - The startup concept is now aligned to a PWA-first MVP.

### App shell and platform

- `src/App.tsx`
  - Citizen, public, and agency routes already exist.
- `vite.config.ts`, `public/manifest.json`, `src/main.tsx`
  - PWA setup already exists.
  - Service worker and manifest are in place.

### Citizen flows

- `src/pages/ReportFlow.tsx`
  - 3-step report flow already exists.
  - Still local-state only; no live Firestore create path.
- `src/pages/Track.tsx`
  - Lists reports, but uses demo data and hardcoded user identity.
- `src/pages/ReportDetail.tsx`
  - Shows map, summary, and timeline.
  - Timeline is mocked and confirm action is not persisted.
- `src/pages/Profile.tsx`
  - No identity-verification UI yet.

### Agency flows

- `src/pages/AgencyDashboard.tsx`
  - Queue and map exist visually.
  - Still effectively demo-backed.
- `src/pages/AgencyCaseDetail.tsx`
  - Status updates are local/demo only.
  - No resolution proof upload or override-reason enforcement yet.

### Data and backend

- `src/lib/types.ts`
  - Report categories, severities, and statuses already exist.
  - Needs simplification and additive support for identity/proof/routing metadata.
- `src/lib/dataSource.ts`
  - Demo mode exists.
  - Live Firestore reads/writes are mostly TODO.
- `src/lib/firebase.ts`
  - Frontend Firebase bootstrap exists.
- `firebase/firestore.rules`, `firebase/storage.rules`, `firebase/firestore.indexes.json`
  - Backend rules and indexes exist.
- `firebase/functions/src/index.ts`
  - `setUserRole`, `analyzeReport`, and `onReportStatusChange` exist.
  - App-side integration remains incomplete.

### Summary of current gap

The repo already has the correct product shape. The remaining work is mostly:

1. wiring live Firebase reads/writes,
2. tightening trust and moderation workflows,
3. simplifying public UX,
4. adding proof-based resolution and prototype identity review.

## 5. Proposed approach (recommended)

### High-level architecture

- **Frontend:** React + TypeScript + Vite PWA
- **Data:** Firestore
- **Uploads:** Firebase Storage
- **Backend logic:** Firebase Functions
- **Maps:** Leaflet + OpenStreetMap
- **Auth:** Firebase Auth

### Recommended implementation order

Build the MVP in this sequence:

1. **Stabilize platform + shared vocabulary**
2. **Wire live reporting and report reads**
3. **Wire public timeline + community actions**
4. **Wire agency/moderator actions + proof policy**
5. **Add routing and AI assist**
6. **Add prototype identity verification**
7. **Add tests, rollout controls, and optional push**

### Recommended product rules

- Public statuses should stay simple: Submitted, Reviewed, Routed, Acknowledged, In progress, Resolved, Reopened.
- `Resolved` should require an after-photo by default.
- Admin/manual override is allowed only with a required reason.
- Community reopen remains enabled.
- National ID + selfie verification is optional/staged, not mandatory for all first-time reports.

### Recommended data boundaries

- `reports`
- `reports/{id}/statusEvents`
- `reports/{id}/confirmations`
- `agencies`
- `users`
- `identityVerifications` or additive identity fields under `users`
- optional `routingRules` or agency ownership config

### Why this approach

- It matches the current repository structure.
- It maximizes hackathon delivery speed.
- It keeps the first version valuable without overbuilding.
- It defers the riskiest work until the core reporting loop is stable.

## 6. Alternatives (with tradeoffs)

| Alternative                                        | Pros                                                       | Cons                                                          | Recommendation |
| -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | -------------- |
| Build native mobile first                          | Better deep native support and push behavior               | Slower to ship, more maintenance, worse early iteration speed | Reject         |
| Build reporting only, no public/agency flows       | Very fast MVP                                              | Too little accountability, weaker community value             | Reject         |
| Make identity verification mandatory for all users | Better anti-abuse on paper                                 | High user drop-off, higher privacy risk, hackathon-unfriendly | Reject         |
| Keep PWA + live Firebase + manual moderation first | Fastest path to real user value with manageable complexity | Needs careful rules, moderation, and UX cleanup               | Recommend      |

## 7. Step plan (< 30 min each)

### Suggested delivery slices

- **PR 1:** platform hardening + shared types/status cleanup
- **PR 2:** live citizen reporting + public tracking
- **PR 3:** agency workflow + proof policy
- **PR 4:** routing + AI assist + identity prototype
- **PR 5:** tests + rollout controls + push polish

### Step-by-step plan

1. **Normalize status vocabulary** — 20 min  
   **Files:** `src/lib/types.ts`, `src/pages/Track.tsx`, `src/pages/ReportDetail.tsx`, `src/pages/AgencyCaseDetail.tsx`  
   **Changes:** Simplify public-facing statuses and labels to match the startup concept.  
   **Verify:** The same labels appear consistently across citizen and agency screens.

2. **Audit PWA metadata and entry behavior** — 20 min  
   **Files:** `public/manifest.json`, `src/main.tsx`, `vite.config.ts`, `index.html`  
   **Changes:** Confirm installability, start URL, service worker behavior, and icon consistency.  
   **Verify:** Lighthouse installability check passes.

3. **Add install prompt component** — 25 min  
   **Files:** `src/components/InstallPrompt.tsx` (new), `src/pages/Home.tsx`  
   **Changes:** Surface Add-to-Home-Screen guidance only when relevant.  
   **Verify:** Eligible browsers show the prompt only before install.

4. **Persist report draft locally** — 25 min  
   **Files:** `src/hooks/useReportDraft.ts` (new), `src/pages/ReportFlow.tsx`, `src/components/AppShell.tsx`  
   **Changes:** Save unfinished report inputs locally and restore them after refresh/offline interruption.  
   **Verify:** Refreshing mid-report restores prior input state.

5. **Add offline banner** — 20 min  
   **Files:** `src/components/OfflineBanner.tsx` (new), `src/components/AppShell.tsx`  
   **Changes:** Show a clear offline indicator and draft-safe behavior.  
   **Verify:** Going offline shows the banner and does not break navigation.

6. **Add manual map-pin fallback** — 30 min  
   **Files:** `src/components/MapPicker.tsx` (new), `src/pages/ReportFlow.tsx`  
   **Changes:** Allow manual location placement when GPS is denied or inaccurate.  
   **Verify:** A report can be completed without geolocation permission.

7. **Separate create/read models** — 25 min  
   **Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`  
   **Changes:** Introduce cleaner report payload types and additive metadata fields for routing, proof, and identity state.  
   **Verify:** TypeScript compiles and all demo pages still render.

8. **Wire live report reads** — 30 min  
   **Files:** `src/lib/dataSource.ts`, `src/lib/firebase.ts`  
   **Changes:** Implement Firestore-backed `listReports`, `getReport`, `listMyReports`, and `listAgencyReports` while preserving demo mode fallback.  
   **Verify:** Live data appears when Firebase is configured; demo mode still works without config.

9. **Implement report image upload + create** — 30 min  
   **Files:** `src/pages/ReportFlow.tsx`, `src/lib/dataSource.ts`, `firebase/storage.rules`, `firebase/firestore.rules`  
   **Changes:** Upload image evidence to Storage and create Firestore report documents.  
   **Verify:** A newly created report appears in Firestore with its image URL.

10. **Wire real tracking timeline** — 25 min  
    **Files:** `src/pages/Track.tsx`, `src/pages/ReportDetail.tsx`, `src/lib/dataSource.ts`  
    **Changes:** Replace mock timelines with `statusEvents` reads.  
    **Verify:** Status changes appear on the citizen detail page.

11. **Persist community confirm action** — 25 min  
    **Files:** `src/pages/ReportDetail.tsx`, `src/lib/dataSource.ts`, `firebase/firestore.rules`  
    **Changes:** Store one-user-one-confirm entries instead of showing a toast-only action.  
    **Verify:** A second confirm by the same user is rejected and the reporter cannot confirm their own case.

12. **Add reopen flow** — 25 min  
    **Files:** `src/pages/ReportDetail.tsx`, `src/lib/dataSource.ts`, `firebase/firestore.rules`  
    **Changes:** Let the community signal that a resolved issue remains unresolved.  
    **Verify:** A reopened issue shows updated status and timeline history.

13. **Add duplicate-report precheck** — 30 min  
    **Files:** `src/lib/dataSource.ts`, `src/pages/ReportFlow.tsx`, `firebase/functions/src/index.ts`  
    **Changes:** Search for nearby active reports and offer a “join existing case” path.  
    **Verify:** Reports near the same location produce duplicate suggestions.

14. **Seed agency records and routing config** — 25 min  
    **Files:** `firebase/functions/src/index.ts`, `firebase/firestore.indexes.json`, `firebase/README.md`  
    **Changes:** Add pilot agency configuration and routing rules for the target geography.  
    **Verify:** A test report receives a suggested agency and routing confidence value.

15. **Wire live agency queue** — 30 min  
    **Files:** `src/pages/AgencyDashboard.tsx`, `src/lib/dataSource.ts`  
    **Changes:** Replace demo queue behavior with real Firestore-backed lists and sorting.  
    **Verify:** Agency users can view the live triage queue.

16. **Wire live agency case updates** — 30 min  
    **Files:** `src/pages/AgencyCaseDetail.tsx`, `src/lib/dataSource.ts`  
    **Changes:** Persist status updates and internal notes to Firestore.  
    **Verify:** Updating a case changes both queue and citizen detail views.

17. **Enforce resolution proof policy** — 25 min  
    **Files:** `src/pages/AgencyCaseDetail.tsx`, `src/lib/dataSource.ts`, `firebase/storage.rules`, `firebase/firestore.rules`  
    **Changes:** Require proof-photo upload when resolving unless an admin/manual override reason is supplied.  
    **Verify:** Resolve without proof is blocked unless a valid override reason is provided.

18. **Store proof media separately from report media if needed** — 25 min  
    **Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`, `firebase/storage.rules`  
    **Changes:** Add a clear data model for resolution proof media and audit metadata.  
    **Verify:** Public detail page shows proof or auditable override reason, not ambiguous resolution state.

19. **Add identity verification schema** — 25 min  
    **Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`, `firebase/firestore.rules`  
    **Changes:** Introduce `identityStatus`, review metadata, and restricted identity document references.  
    **Verify:** Sensitive identity data is separated from public report data.

20. **Build identity verification prototype UI** — 30 min  
    **Files:** `src/pages/Profile.tsx`, `src/components/IdentityVerificationFlow.tsx` (new), `src/lib/dataSource.ts`  
    **Changes:** Add National ID upload + selfie capture + pending review state.  
    **Verify:** A signed-in user can submit a verification request that lands in `pending_review`.

21. **Restrict identity media storage** — 25 min  
    **Files:** `firebase/storage.rules`, `firebase/firestore.rules`, `src/lib/dataSource.ts`  
    **Changes:** Store ID and selfie assets in protected paths only and add duplicate flagging support.  
    **Verify:** Identity files are inaccessible from public client paths.

22. **Add identity review workflow** — 30 min  
    **Files:** `src/pages/Profile.tsx`, `src/pages/AgencyDashboard.tsx`, `src/lib/dataSource.ts`, `firebase/functions/src/index.ts`  
    **Changes:** Add reviewer actions for approve/reject with note capture.  
    **Verify:** Reviewer decisions correctly change the user’s identity state.

23. **Keep AI assistive and reversible** — 25 min  
    **Files:** `firebase/functions/src/index.ts`, `src/lib/types.ts`, `src/lib/dataSource.ts`  
    **Changes:** Limit AI to suggestion fields and make app behavior safe when AI is unavailable.  
    **Verify:** Reports still work even if AI fails or is disabled.

24. **Add feature flags and rollout guards** — 25 min  
    **Files:** `src/lib/featureFlags.ts` (new), `src/lib/dataSource.ts`, `firebase/README.md`  
    **Changes:** Introduce toggles for AI assist, identity prototype, live submission, and push.  
    **Verify:** Features can be disabled without breaking the rest of the app.

25. **Add push support only after core flows are stable** — 30 min  
    **Files:** `public/firebase-messaging-sw.js`, `src/lib/firebase.ts`, `src/pages/Notifications.tsx`, `firebase/functions/src/index.ts`  
    **Changes:** Wire FCM token registration and status-change notifications after VAPID is configured.  
    **Verify:** Supported browsers receive a test notification.

26. **Add focused unit/integration coverage** — 30 min  
    **Files:** `src/test/`, `vitest.config.ts`, `firebase/functions/src/index.ts`  
    **Changes:** Cover status transitions, duplicate detection, routing, proof validation, and identity state changes.  
    **Verify:** `npm test` passes and catches intentional regressions.

27. **Add mobile E2E coverage** — 30 min  
    **Files:** `playwright.config.ts` (new), `e2e/report-flow.spec.ts` (new), `package.json`  
    **Changes:** Cover submit → track → confirm → resolve → reopen flows on a mobile viewport, plus identity verification submission.  
    **Verify:** The core mobile journey passes end-to-end.

## 8. Test plan

### Unit tests

- Status transition rules
- Resolution proof requirement and override-reason validation
- Duplicate detection by radius/geohash
- Routing confidence decisions
- Identity verification state transitions
- Feature-flag fallback behavior

### Integration tests

- Report create path writes to Storage and Firestore correctly
- `statusEvents` are created and rendered correctly
- Confirm and reopen actions enforce permission rules
- Restricted identity media stays outside public access paths
- Demo mode remains available when Firebase config is missing

### End-to-end tests

- Create report on mobile viewport
- View public case page and timeline
- Confirm an issue as another user
- Resolve with proof photo as agency/moderator
- Reopen after false resolution
- Submit National ID + selfie verification request

### Regression priorities

- Do not regress demo mode
- Do not regress installability
- Do not allow resolve without proof/override reason
- Do not expose identity documents publicly

## 9. Rollout & rollback plan

### Rollout

1. **Internal dogfood**
   - Team tests all citizen and agency flows using live Firebase.
2. **Invite-only pilot**
   - Limited geography and limited moderator group.
3. **Public pilot**
   - Open reporting and public map to the selected pilot area.
4. **Measured expansion**
   - Add more areas only after routing quality and moderation load are stable.

### Rollback

- Disable live submission if report quality collapses.
- Disable AI assist if it reduces trust.
- Disable identity prototype if privacy/review load becomes risky.
- Disable push if browser delivery becomes noisy or unreliable.
- Route all new reports to manual review if routing accuracy drops.
- Never delete data as the first rollback action.

## 10. Risks & mitigations

| Risk                                          | Mitigation                                                         |
| --------------------------------------------- | ------------------------------------------------------------------ |
| PWA behavior differs across browsers          | Keep core flows browser-safe and treat push as optional            |
| Demo-mode assumptions leak into live mode     | Add explicit tests for Firebase-backed reads/writes                |
| Resolve-without-proof weakens trust           | Enforce proof-by-default and audit override reasons                |
| Identity prototype becomes too invasive       | Keep it optional, scoped, access-controlled, and retention-limited |
| Routing confidence is poor in the first pilot | Use manual reassignment and small pilot geography                  |
| Community confirmation becomes noisy          | Enforce one-user-one-confirm and use moderation thresholds         |
| Firebase rules drift from UI assumptions      | Test rules-sensitive flows with integration coverage               |

## 11. Open questions

- Which exact pilot geography should be encoded into the first routing rules?
- Should first-time reporting require full sign-in or allow anonymous-auth-only flow?
- Which users can perform identity review in the pilot?
- Should identity verification unlock only trust weighting, or also unlock additional actions?
- Is push notification setup required for the first demo, or can it wait until after live reporting is stable?
- Should proof-photo overrides be limited to admins only, or also permitted for agency users with reviewer notes?
- Do we want a separate moderator role distinct from `agency_official` in this MVP?
