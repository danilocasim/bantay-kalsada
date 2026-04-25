# Startup Concept — PWA-First Community Road Reporting Platform

## 1. Goal

Build the product as a **PWA-first** community road reporting platform for an early pilot, not as a native mobile app yet.

The user need is simple:

> “May lubak o baha dito. Ayoko ng mahabang form. Gusto ko picture, location, submit, tapos kita ko agad kung may umaaksyon.”

The product should help citizens report hazards in under 2 minutes, help nearby residents confirm whether the issue is real and still unresolved, and help agencies or community partners track the case publicly until it is fixed.

**Senior engineer validation:** starting with a PWA is the right decision for this stage. The current repository is already a React + Vite + PWA-capable codebase, so a PWA gives the team the fastest path to real usage, lower maintenance cost, and enough mobile capability to validate demand before paying the native-app complexity tax.

**Explicitly out of scope for phase 1:**

- Dedicated iOS and Android apps
- Video-first reporting
- SMS, Messenger, kiosk, and call-center intake on day one
- Full government API integrations
- Advanced computer vision and predictive analytics
- Nationwide coverage
- Fully autonomous AI routing or legal/jurisdiction decisions

## 2. Success criteria

### Functional success

- A citizen can open the app on mobile web or from the home screen, take a photo, capture or adjust location, choose a category, add a short note, and submit a report.
- A submitted report gets a public case page with a tracking ID and visible status timeline.
- Other residents can mark **Confirm issue**, **Still unresolved**, or **Resolved**.
- A moderator or partner agency can acknowledge, update, and resolve a case with proof.
- A user can complete a **prototype identity verification** flow by uploading a National ID image and a selfie/face scan, and the account is marked as `pending_review`, `verified`, or `rejected` for pilot trust purposes.
- The system suggests the likely responsible office for the pilot area and allows correction.

### Pilot success

- Launch in **one city, municipality, or district** only.
- Start with **4 categories only**:
  1. Pothole / damaged road
  2. Flooded area
  3. Drainage issue
  4. Open manhole / road hazard
- Reach **100–300 pilot reporters** in the first 60–90 days.
- Keep median citizen report time under **2 minutes**.
- Get at least **70% first-pass routing accuracy** for pilot reports.
- Get at least **30% of valid reports** with a second community confirmation.
- Produce clear before/after proof for resolved cases so the community sees real impact.

### Non-functional success

- The app is installable as a PWA.
- The initial mobile experience remains usable on mid-range Android devices and unstable 4G connections.
- Draft data survives accidental refresh/close while the user is still reporting.
- Public pages do not expose reporter identity by default.
- National ID and selfie uploads are treated as sensitive data and are never exposed on public case pages.
- AI failures do not block report submission or tracking.

## 3. Assumptions

- The first pilot is Philippines-focused.
- Most early users will come from mobile browsers, especially Android.
- The team should optimize for **one codebase** and fast iteration.
- The existing repo remains the implementation base: React, TypeScript, Vite, Firebase, Leaflet, and PWA support.
- The first partner agency may not offer formal API integration; email/dashboard/manual workflow is acceptable initially.
- Human moderation is available for routing corrections, abuse handling, and low-confidence cases.
- Push notifications are useful but must not be critical to core value because PWA push support varies by browser and platform.
- Photos are enough for MVP; video should wait until there is evidence that photos are insufficient.
- Routing data for barangay/city/provincial/national ownership may be incomplete at launch, so the system must support reassignment and confidence scoring.
- There is **no** direct PhilSys or government identity-verification API integration in the hackathon build.
- National ID upload + face scan is a **prototype trust layer**, not production-grade eKYC and not a legal identity guarantee.
- Any face matching used in the prototype must have a manual-review fallback and must not be treated as the sole source of truth.

## 4. Current state (files/flows)

| File / flow                                                                                                     | What exists today                                                                                                       | What it means for the plan                                                               |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `docs/Startup Concept.md`                                                                                       | Current concept is ambitious and broad. It still points toward multi-channel intake and earlier native/mobile thinking. | The concept needs to be narrowed to a PWA-first pilot strategy.                          |
| `package.json`                                                                                                  | The repo already uses React, TypeScript, Firebase, Leaflet, and `vite-plugin-pwa`.                                      | The current stack already supports the recommended first platform.                       |
| `vite.config.ts`                                                                                                | `VitePWA` is configured with runtime caching for map tiles.                                                             | PWA groundwork already exists and only needs product hardening, not a platform rewrite.  |
| `public/manifest.json` + `src/main.tsx`                                                                         | The app already has manifest metadata and service-worker registration behavior.                                         | Installability is partially in place today.                                              |
| `src/App.tsx`                                                                                                   | The app already routes both citizen and agency screens inside one web app.                                              | A single PWA serving citizen, public, and agency roles is aligned with the repo.         |
| `src/pages/ReportFlow.tsx`                                                                                      | There is already a 3-step mobile-first report flow: photo, location, category/description.                              | The core user journey already matches a PWA-first MVP.                                   |
| `src/pages/PublicMap.tsx`, `src/pages/Track.tsx`, `src/pages/ReportDetail.tsx`, `src/pages/AgencyDashboard.tsx` | Public map, tracking, and agency queue screens already exist as UI prototypes.                                          | The repo already reflects the right product shape.                                       |
| `src/lib/types.ts`                                                                                              | Categories, statuses, severity, urgency, and agency linkage are already modeled.                                        | The data model is close to MVP needs, but the public workflow should be simplified.      |
| `src/lib/dataSource.ts`                                                                                         | Demo mode exists, but live Firestore reads/writes are mostly TODOs.                                                     | The main gap is backend wiring and production behavior, not UI direction.                |
| `firebase/README.md`, `firebase/functions/src/index.ts`, `firebase/firestore.rules`                             | Firebase backend, security rules, and Cloud Functions direction already exist.                                          | The backend strategy supports a PWA-first rollout with moderate complexity.              |
| `src/lib/firebase.ts`, `firebase/storage.rules`, `firebase/firestore.rules`                                     | Auth and storage primitives exist, but there is no ID-verification flow, reviewer queue, or biometric data model yet.   | National ID + face scan must stay prototype-only, tightly scoped, and access-controlled. |

### Current behavior summary

- The repository is already closer to a **PWA product prototype** than to a native-app project.
- The codebase can already support the recommended early strategy.
- The biggest mismatch is conceptual: the original startup plan is broader than the current implementation path and broader than what an early pilot should attempt.

## 5. Proposed approach (recommended)

### Recommendation

Build **one installable PWA** first, with three connected surfaces in the same product:

1. **Citizen reporting flow**
2. **Public community tracking/map**
3. **Agency or moderator triage dashboard**

This is the right balance of simplicity and value:

- **Simple enough** to launch and learn quickly
- **Not too simple** because it still creates public accountability, routing, and community confirmation
- **Useful to the community** because it turns isolated complaints into visible, trackable cases

### Product positioning

This should not be pitched as “just another complaint app.”

It should be positioned as:

**A community road issue tracker that helps people report hazards fast, helps neighbors confirm them, and helps agencies or civic partners act on one public source of truth.**

### MVP scope to build first

#### Citizen value

- Report with **1 required photo** and optional short note
- Auto-capture GPS, with manual pin adjustment when location is wrong or denied
- Very short category selection
- Public case page immediately after submission
- Status timeline with simple, human-readable labels
- Community confirmation and reopen flow
- Optional or staged **National ID + selfie verification** for higher-trust participation during the pilot

#### Agency / moderator value

- Triage queue sorted by urgency and age
- Suggested agency routing with confidence indicator
- Ability to reassign, acknowledge, schedule, mark in progress, and resolve
- Required after-photo on resolution, with admin/manual override only when a reason is provided

#### Public value

- Map of active cases
- Filters by category and status
- Public proof of progress and resolution

### What to defer

- Video uploads
- Social-media channel ingestion
- SMS/hotline integration
- Full machine-vision severity scoring
- Highly granular jurisdiction automation across the whole country
- Native apps
- Large analytics dashboards beyond what the pilot needs
- Production-grade biometric verification, liveness detection, and government identity API integrations

### Suggested public workflow

Keep the public workflow simpler than the current status model.

Recommended public statuses:

1. **Submitted**
2. **Reviewed**
3. **Routed**
4. **Acknowledged**
5. **In progress**
6. **Resolved**
7. **Reopened**

Internal details such as AI confidence, moderation review, or community verification can still exist as fields or timeline events, but they should not make the public workflow harder to understand.

### High-level architecture

#### Client

- **PWA shell:** React + Vite + TypeScript
- **Navigation:** same app for citizen, public viewer, and agency routes
- **Mobile capabilities:** camera/photo upload, geolocation, install prompt, push notifications where supported

#### Backend

- **Auth:** Firebase Auth
- **Data:** Firestore
- **Images:** Firebase Storage
- **Server logic:** Cloud Functions for routing, notifications, and optional AI assistance
- **Maps:** Leaflet + OpenStreetMap

### Recommended data boundaries

| Entity                        | Purpose                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `reports`                     | Main case record: category, location, severity, status, reporter, evidence, routing suggestion |
| `statusEvents`                | Timeline of changes for public tracking and auditability                                       |
| `confirmations`               | Community confirmations / unresolved signals                                                   |
| `agencies`                    | Pilot agency directory and jurisdiction ownership                                              |
| `routingRules`                | Config-driven routing rules for pilot geography                                                |
| `featureFlags` / pilot config | Safe rollout and rollback controls                                                             |

### Data flow

1. Citizen opens the PWA and starts a report.
2. The app captures a photo and location, or lets the user adjust the pin manually.
3. The app stores a local draft while the user is still filling the form.
4. On submit, the app uploads the image and creates a `report` record.
5. A backend workflow adds derived fields such as geohash, duplicate candidates, routing suggestion, and optional AI summary.
6. If routing confidence is high, the report is assigned to the likely office; otherwise it goes to manual review.
7. The public case page becomes visible immediately with a tracking ID.
8. Community members confirm or flag whether the issue is still unresolved.
9. Agency staff or moderators update status and attach proof when resolved.
10. The public timeline remains visible even if the case is reopened.

### AI role in MVP

AI should be an assistant, not the product.

Recommended uses in phase 1:

- Clean up short descriptions into a readable summary
- Suggest category
- Suggest severity
- Suggest possible duplicate matches
- Suggest likely agency based on configured rules

AI should **not** be trusted to:

- make final legal jurisdiction decisions
- auto-resolve cases
- replace moderation
- become the only source of severity or routing truth

### Resolution proof policy

For MVP, a case should **not** be marked `Resolved` without proof by default.

Recommended rule:

- Require an **after photo** when an LGU or agency marks a case as resolved
- Allow an **admin/manual override** only if the staff member provides a reason such as:
  - emergency repair completed but field photo unavailable
  - contractor confirmation received, photo pending
  - repair validated through a trusted on-site partner
- Keep **community reopen** enabled so residents can still say the issue is not actually fixed

This is the right compromise for a pilot:

- strong enough to create public trust
- flexible enough for messy field operations
- still reviewable and auditable later

### Identity verification for hackathon (recommended prototype)

Your idea to use **National ID upload + face scan** is valid **only as a prototype trust layer** for a hackathon.

As a senior engineer, I would **not** recommend building full biometric verification or real eKYC in this phase. That is too risky, too compliance-heavy, and too complex for a hackathon PWA.

Instead, use this narrower approach:

#### Recommended trust model

- **Public viewer:** can browse map and public cases without identity verification
- **Signed-in user:** can create an account and use the app normally
- **Pilot-verified user:** has uploaded a National ID image and a selfie/face scan, then passed prototype verification or moderator review

#### Recommended prototype flow

1. User signs in with a simple account method.
2. User uploads a **National ID image**.
3. User captures a **selfie / face scan** in the PWA camera flow.
4. The system stores the verification request as `pending_review`.
5. The system may run a **basic prototype face-match check** or face-presence check, but this is only advisory.
6. A moderator or admin can mark the request as `verified` or `rejected`.
7. The account receives a trust badge or higher-trust status for pilot use.

#### What this prototype is for

- reduce duplicate and fake accounts
- raise trust in confirmations and reports
- help prove “one real person, one pilot account” at a lightweight level

#### What this prototype is **not** for

- legal identity verification
- government-grade KYC
- full biometric authentication
- permanent face-recognition enrollment

#### Recommended implementation boundaries

- Store ID images and selfies in a **restricted storage path**, never in public report media
- Store only the minimum verification metadata in Firestore, such as:
  - `identityStatus: unverified | pending_review | verified | rejected`
  - `identityReviewReason`
  - `identityVerifiedAt`
  - `identityReviewerUid`
  - `identityIdHash` for duplicate detection if an ID number is captured
- If possible, store a **hash of the normalized ID number** instead of exposing raw ID values in general app data
- Do **not** expose raw biometric comparison data in the client UI
- Do **not** rely only on automated face matching; manual review must remain possible
- Add a short retention policy so raw National ID and selfie files can be deleted after review or after a short pilot window

#### Product recommendation

For the hackathon, the best balance is:

- keep reporting flow fast
- make verification available as a **trust upgrade**
- optionally require verification for higher-trust actions such as repeated confirmations, moderator programs, or heavier report volume

That is better than hard-blocking every first-time report behind National ID verification, which would likely reduce adoption too early.

### Error handling and user-visible semantics

| Scenario                     | User-visible behavior                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| No network during reporting  | Save draft locally and show “Draft saved. Submit when you’re back online.”                     |
| GPS denied or inaccurate     | Require manual pin placement before final submit                                               |
| Image upload fails           | Keep draft and offer retry; never silently discard evidence                                    |
| Routing confidence is low    | Show “Pending routing review” internally; do not confidently display the wrong office publicly |
| Duplicate likely exists      | Offer “Join existing case” or “Submit anyway”                                                  |
| AI service fails             | Submit the report normally without blocking the citizen                                        |
| Agency does not respond      | Keep the case visible and allow escalation or moderator follow-up                              |
| National ID upload fails     | Keep the account usable but leave identity status as unverified or pending                     |
| Face scan mismatch           | Send to manual review instead of auto-rejecting a legitimate user                              |
| Resolved without proof photo | Block the status change unless an admin/manual override reason is entered                      |

### Community and trust model

To stay useful and not turn into noise:

- Publicly hide reporter identity by default
- Require photo evidence for launch
- Limit anonymous abuse with authentication, device limits, or moderation thresholds
- Use “Confirm issue” language instead of social-style upvotes
- Require proof photo for resolved cases by default, with override reason if unavailable
- Allow community reopen if the issue remains unfixed
- Prefer higher trust weighting for users who completed the prototype identity-verification flow

### Philippines routing model for the pilot

For a Philippines-focused launch, routing should follow a configurable ownership model such as:

- **Barangay/local street issues:** barangay or city/municipal engineering office
- **City/municipal drainage and local roads:** city/municipal engineering or related local office
- **Provincial roads/drainage:** provincial engineering office
- **National roads / major flood-control assets:** DPWH district office
- **Metro Manila special coverage where relevant:** MMDA plus the concerned LGU

The platform should complement existing channels such as 8888 or eGov complaint systems, not claim to replace them.

### Backwards compatibility and migration strategy

- Keep the MVP data model additive so new categories and fields can be introduced later without breaking older records.
- Keep routing rules config-driven so adding a second pilot city does not require a code fork.
- Treat the PWA as the canonical client first; if native apps are needed later, they should reuse the same backend contracts and case model.
- Start with photo-only reports and add video later only if pilot evidence shows it materially improves resolution quality.
- Keep identity verification in a separate, additive trust model so it can evolve later into vendor-based KYC or be removed without breaking report records.

## 6. Alternatives (with tradeoffs)

| Alternative                                                        | Pros                                                                         | Cons                                                                                                    | Verdict                                                   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Native mobile app first** (Flutter / React Native)               | Better native push behavior, deeper device APIs, stronger app-store presence | Slower to launch, higher cost, more QA overhead, extra release friction, weaker early iteration speed   | Not recommended for this phase                            |
| **Plain responsive website only** (no PWA features)                | Lowest build complexity                                                      | Worse repeat usage, weaker install story, less app-like feel, weaker offline/draft behavior             | Better than native-first, but still weaker than PWA-first |
| **PWA + SMS/Messenger/kiosk from day one**                         | Larger intake reach                                                          | Very high ops burden, more abuse risk, harder deduplication, harder normalization, slower MVP           | Good future expansion, not a day-one plan                 |
| **Hard-block all reports behind full ID + biometric verification** | Stronger uniqueness controls on paper                                        | High drop-off, privacy risk, hackathon-inappropriate complexity, hard compliance questions, slower demo | Not recommended for this phase                            |

**Recommended default:** PWA-first, single-city pilot, single codebase, photo-first reporting, public tracking, and a small agency/moderator workflow.

**Updated recommendation:** require proof photo for `Resolved` by default with admin/manual override reason, keep community reopen enabled, and add National ID + face scan only as a **prototype verification layer**, not as full production KYC.

## 7. Step plan (< 30 min each)

### Suggested PR breakdown

- **PR 1:** PWA reliability + report-flow UX
- **PR 2:** Live reporting + public tracking
- **PR 3:** Agency routing + case updates
- **PR 4:** AI assist + notifications + observability + tests

1. **Lock the MVP vocabulary and public status set** — **20 min**  
   **Files:** `src/lib/types.ts`, `src/pages/Track.tsx`, `src/pages/ReportDetail.tsx`, `src/pages/AgencyCaseDetail.tsx`  
   **Change:** Reduce public-facing complexity so the product uses the simpler status model and clearer labels such as Confirm issue / Still unresolved.  
   **Verify:** Public UI shows the simplified status set consistently across list, detail, and agency pages.

2. **Audit and harden PWA metadata** — **20 min**  
   **Files:** `public/manifest.json`, `index.html`, `vite.config.ts`, `src/main.tsx`  
   **Change:** Confirm start URL, app name, icons, theme color, service worker registration, and update behavior.  
   **Verify:** Lighthouse installability passes and the app can be installed from a supported mobile browser.

3. **Add install prompt UI** — **25 min**  
   **Files:** `src/components/InstallPrompt.tsx` (new), `src/pages/Home.tsx`  
   **Change:** Add a lightweight “Add to Home Screen” prompt shown only when the browser supports it and the app is not yet installed.  
   **Verify:** Eligible browsers show the prompt once and installed browsers stop showing it.

4. **Add offline banner and draft persistence** — **25 min**  
   **Files:** `src/components/OfflineBanner.tsx` (new), `src/hooks/useReportDraft.ts` (new), `src/components/AppShell.tsx`, `src/pages/ReportFlow.tsx`  
   **Change:** Persist unfinished report data locally and surface a visible offline state.  
   **Verify:** Turning the network off preserves the draft and restores it after refresh.

5. **Improve report location fallback** — **30 min**  
   **Files:** `src/components/MapPicker.tsx` (new), `src/pages/ReportFlow.tsx`  
   **Change:** Add manual pin placement for cases where GPS is denied or inaccurate.  
   **Verify:** A user can complete a report without granting geolocation and the saved coordinates match the selected pin.

6. **Define report create/read contracts cleanly** — **25 min**  
   **Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`  
   **Change:** Separate read models from create/update payloads; add fields such as routing confidence, duplicate candidate IDs, and proof photo URLs as optional additive fields.  
   **Verify:** TypeScript compiles cleanly and existing demo flows still render.

7. **Wire live Firestore reads while preserving demo mode** — **30 min**  
   **Files:** `src/lib/dataSource.ts`, `src/lib/firebase.ts`  
   **Change:** Implement real `listReports`, `getReport`, `listMyReports`, and `listAgencyReports` paths behind the existing Firebase configuration check.  
   **Verify:** With Firebase env vars set, pages render live data; without them, demo mode still works.

8. **Define trust-tier and identity-verification schema** — **25 min**  
   **Files:** `src/lib/types.ts`, `src/lib/dataSource.ts`, `firebase/firestore.rules`  
   **Change:** Add additive fields and/or collections for `identityStatus`, reviewer metadata, restricted uploads, and optional ID-hash duplicate checks.  
   **Verify:** TypeScript models compile cleanly and security rules clearly separate public report data from sensitive identity data.

9. **Prototype National ID upload + selfie capture flow** — **30 min**  
   **Files:** `src/pages/Profile.tsx`, `src/components/IdentityVerificationFlow.tsx` (new), `src/lib/dataSource.ts`  
   **Change:** Add a simple verification flow for uploading a National ID image and capturing a selfie/face scan inside the PWA.  
   **Verify:** A signed-in user can submit a verification request that lands in `pending_review`.

10. **Restrict sensitive identity uploads and add duplicate flagging** — **30 min**  
    **Files:** `firebase/storage.rules`, `firebase/firestore.rules`, `src/lib/dataSource.ts`  
    **Change:** Store identity media in restricted paths, hash any captured ID number for duplicate checks, and never expose raw identity assets publicly.  
    **Verify:** Public clients cannot read ID/selfie files and duplicate identity attempts are flagged or reviewable.

11. **Add reviewer/admin verification workflow** — **30 min**  
    **Files:** `src/pages/AgencyDashboard.tsx`, `src/pages/Profile.tsx`, `src/lib/dataSource.ts`, `firebase/functions/src/index.ts`  
    **Change:** Add a minimal reviewer flow to approve, reject, or annotate identity-verification requests.  
    **Verify:** A pending verification request can be manually reviewed and the user’s status updates correctly.

12. **Implement photo upload + report create path** — **30 min**  
    **Files:** `src/pages/ReportFlow.tsx`, `src/lib/dataSource.ts`, `firebase/storage.rules`, `firebase/firestore.rules`  
    **Change:** Upload report images to Storage, create the Firestore report record, and keep write rules strict.  
    **Verify:** A new report appears in Firestore with its image URL and initial status.

13. **Wire tracking pages to live status history** — **25 min**  
    **Files:** `src/pages/Track.tsx`, `src/pages/ReportDetail.tsx`, `src/lib/dataSource.ts`  
    **Change:** Read `statusEvents` and show a real status timeline rather than only demo data.  
    **Verify:** Updating a report status is reflected on the citizen tracking page.

14. **Add community confirm / reopen actions** — **25 min**  
    **Files:** `src/pages/ReportDetail.tsx`, `src/lib/dataSource.ts`, `firebase/firestore.rules`  
    **Change:** Add one-user-one-confirm logic and a reopen signal for unresolved cases.  
    **Verify:** A user can confirm another user’s report once, cannot confirm their own report, and can mark a resolved issue as still unresolved.

15. **Add duplicate suggestion before submit** — **30 min**  
    **Files:** `src/lib/dataSource.ts`, `src/pages/ReportFlow.tsx`, `firebase/functions/src/index.ts`  
    **Change:** Search for nearby active cases by geohash/radius and offer the user a chance to join an existing case.  
    **Verify:** Submitting near an existing active report shows duplicate suggestions instead of blindly creating noise.

16. **Seed agency directory and routing rules** — **25 min**  
    **Files:** `firebase/functions/src/index.ts`, `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `firebase/README.md`  
    **Change:** Define the pilot agency records and a small, configurable routing ruleset for the launch geography.  
    **Verify:** Test reports in pilot coordinates resolve to a likely office with a visible confidence score.

17. **Implement rule-based routing with manual fallback** — **30 min**  
    **Files:** `firebase/functions/src/index.ts`, `src/lib/types.ts`  
    **Change:** Route reports using location + issue type + configured ownership rules; low-confidence cases fall into manual review instead of pretending certainty.  
    **Verify:** High-confidence cases auto-route; ambiguous cases stay reviewable.

18. **Wire agency queue and case-detail actions to live data** — **30 min**  
    **Files:** `src/pages/AgencyDashboard.tsx`, `src/pages/AgencyCaseDetail.tsx`, `src/lib/dataSource.ts`  
    **Change:** Replace demo-only agency queue behavior with live Firestore reads and writes.  
    **Verify:** Agency users can see open cases, sort them, and open a live case detail page.

19. **Add resolution proof upload with override reason** — **25 min**  
    **Files:** `src/pages/AgencyCaseDetail.tsx`, `src/lib/dataSource.ts`, `firebase/storage.rules`, `firebase/firestore.rules`  
    **Change:** Require an after-photo when marking a case resolved, but allow admin/manual override only with a required reason field.  
    **Verify:** A resolved case shows proof media on the public detail page, or an auditable override reason when proof is unavailable.

20. **Keep AI assistive and behind a feature flag** — **25 min**  
    **Files:** `firebase/functions/src/index.ts`, `src/lib/types.ts`, `src/lib/dataSource.ts`  
    **Change:** Limit AI to summary/category/severity suggestions and keep routing decisions reversible.  
    **Verify:** Turning AI off does not break the report flow or agency workflow.

21. **Add web-push opt-in and inbox plumbing** — **30 min**  
    **Files:** `public/firebase-messaging-sw.js`, `src/lib/firebase.ts`, `src/pages/Notifications.tsx`, `firebase/functions/src/index.ts`  
    **Change:** Store tokens, request permission gracefully, and notify on status changes where supported.  
    **Verify:** Supported browsers receive a test notification after a status update.

22. **Add observability and launch flags** — **25 min**  
    **Files:** `src/lib/analytics.ts` (new), `src/lib/dataSource.ts`, `firebase/functions/src/index.ts`  
    **Change:** Track submit success/failure, routing corrections, duplicate merges, status-change latency, and verification funnel drop-off; add toggles for `liveSubmission`, `aiAssist`, `identityPrototype`, and `pushEnabled`.  
    **Verify:** Metrics appear in logs/analytics and features can be turned off without redeploying all app code.

23. **Add focused unit and integration tests** — **30 min**  
    **Files:** `src/test/`, `vitest.config.ts`, `firebase/functions/src/index.ts`  
    **Change:** Cover routing rules, status transitions, duplicate detection, identity-verification state changes, and report payload validation.  
    **Verify:** `npm test` passes and catches at least one intentional regression in routing or status logic.

24. **Add mobile E2E coverage for the critical path** — **30 min**  
    **Files:** `playwright.config.ts` (new), `e2e/report-flow.spec.ts` (new), `package.json`  
    **Change:** Add end-to-end coverage for report creation, identity-verification submission, tracking, and agency update on a mobile viewport.  
    **Verify:** The scripted flow passes from citizen submit to visible status update, and the verification prototype can reach `pending_review`.

25. **Prepare pilot launch controls and rollback switches** — **20 min**  
    **Files:** `firebase/README.md`, `src/lib/featureFlags.ts` (new), `src/lib/dataSource.ts`  
    **Change:** Document the operational runbook and make live submission, AI assist, identity prototype, and push independently disable-able.  
    **Verify:** The team can force the app into read-only/manual-review mode without losing existing reports.

## 8. Test plan

### Unit tests

- Routing rule evaluation by issue type + coordinates + pilot boundary
- Status transition rules
- Duplicate detection radius/geohash matching
- Urgency score calculation if urgency remains part of the product
- Feature-flag fallback behavior
- Identity-status transitions and override-reason validation

### Integration tests

- Report creation writes Storage + Firestore correctly
- Agency status update creates `statusEvents`
- Community confirmation increments the right counters and respects permissions
- Demo mode still works when Firebase configuration is absent
- National ID and selfie uploads land in restricted storage and never in public media paths
- Resolved-without-photo requires override reason and audit data

### End-to-end tests

- Citizen report submission on mobile viewport
- Public detail page shows the new case and status timeline
- Community member confirms the issue
- Agency user acknowledges and resolves with proof photo
- Reopen flow works after a false resolution
- User submits National ID + selfie verification request and reaches `pending_review`

### Key edge cases and negative tests

- GPS denied
- Network drops mid-report
- Duplicate report near the same pin
- Unsupported push/browser behavior
- AI service timeout
- Storage upload failure
- Agency changes status without proof photo
- Reporter tries to confirm their own report
- Duplicate National ID attempt
- Face scan mismatch or unreadable selfie
- Reviewer override without a reason

### Fixtures and mocks

- Seeded demo reports for stable local UI development
- Mock geolocation responses
- Mock Firestore/Storage adapters in unit tests
- Small image fixtures for upload and duplicate scenarios
- A seeded pilot agency dataset for routing tests

## 9. Rollout & rollback plan

### Rollout

1. **Internal dogfood**
   - Team uses the PWA in demo and live mode.
   - Validate install flow, draft persistence, and report creation.

2. **Invite-only pilot**
   - Limited users from one barangay, neighborhood, or city district.
   - One partner office or one trusted moderator queue.
   - Identity verification prototype stays moderated and can be limited to a smaller tester group.

3. **Public local pilot**
   - Open the public map and reporting flow to a defined pilot geography.
   - Keep routing rules and moderation focused on that area only.

4. **Measured expansion**
   - Add another district or agency only after routing accuracy, moderation load, and response quality are acceptable.

### Monitoring during rollout

- Report submission success rate
- Median time from submit to public case visibility
- Duplicate merge rate
- Routing correction rate
- Agency acknowledgment latency
- Reopen rate after “resolved”
- Daily moderation queue size
- Identity verification completion rate
- Identity verification rejection / duplicate-flag rate

### Rollback

- Disable `liveSubmission` and switch the app to read-only public tracking if incoming reports become too noisy or backend writes become unstable.
- Disable `aiAssist` if summaries or severity suggestions start causing wrong triage behavior.
- Disable `identityPrototype` if privacy, review-load, or UX issues appear during the pilot.
- Disable `pushEnabled` if notification delivery becomes noisy or unreliable.
- Route all new reports to manual review if routing confidence degrades.
- Preserve existing reports; do not delete pilot data as a first response.

## 10. Risks & mitigations

| Risk                                             | Why it matters                                                               | Mitigation                                                                                                      |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| PWA limitations on some browsers, especially iOS | Push and background behavior are not equally strong everywhere               | Treat push as a bonus, not a dependency; keep the core experience browser-safe                                  |
| Wrong agency routing                             | Public trust drops fast if the system confidently routes to the wrong office | Use confidence scores, pilot-only routing rules, and manual reassignment                                        |
| Fake, low-quality, or politically noisy reports  | The platform can become spam instead of signal                               | Require photos, rate-limit risky users, add moderation, and prefer confirmation language over social voting     |
| Over-scoping AI too early                        | AI can add cost and complexity without improving outcomes                    | Keep AI assistive, optional, and easy to turn off                                                               |
| Poor network conditions                          | Target users may lose connection mid-report                                  | Use local drafts, small image uploads, and retry-friendly UX                                                    |
| Agency non-response                              | A silent queue can damage the product’s credibility                          | Make accountability visible, pilot with willing partners, and keep public tracking honest                       |
| Trying to scale nationally too early             | Jurisdiction and moderation complexity will explode                          | Stay city- or district-first until the operating model works                                                    |
| National ID and face data are highly sensitive   | Privacy, legal, and trust risks are much higher than normal account data     | Keep it prototype-only, minimize retention, restrict access, require consent, and avoid production-grade claims |
| Face-match false positives or false negatives    | Legitimate users may be blocked or bad actors may slip through               | Use manual review fallback and never rely on automated matching alone                                           |

## 11. Open questions

- Which exact city, barangay, or district is the first pilot area?
- Will launch-day reporting require sign-in, anonymous auth, or a mixed model?
- Which partner office will actually acknowledge and update cases during the pilot?
- What routing dataset will be trusted first: manually curated pilot rules, LGU maps, DPWH data, or a mix?
- Should the public-facing product language be English, Filipino, or bilingual from day one?
- Is “before/after proof photo required for resolution” acceptable to the pilot partner, or only encouraged?
- Is the first success story more important to optimize for potholes, flooding, or drainage?
- Is National ID + selfie verification required for **all** reporters, or only for higher-trust participation tiers?
- What is the legal basis and consent wording for collecting National ID images and face scans in the pilot?
- How long can raw ID and selfie files be retained before deletion in the hackathon prototype?
