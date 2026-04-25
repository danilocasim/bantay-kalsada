# Bantay Kalsada — PWA UX/UI Design Direction

This design document revises the current product direction using:

- `docs/Startup Concept.md`
- `docs/plan.md`
- the current repository design system and screens

The goal is not to make the app look fancier. The goal is to make it **clearer, faster, calmer, and more trustworthy** for mobile users in real road-reporting situations.

## 1. Design goal

Design Bantay Kalsada as a **mobile-first civic utility**, not a social app and not a generic dashboard.

The user mindset is usually:

> “May nakita akong problema. I need to report it fast, make sure the location is correct, and know if someone will actually act on it.”

So the interface should optimize for:

- **speed** — report in under 2 minutes
- **clarity** — clear labels, no vague system language
- **trust** — visible status, visible proof, visible accountability
- **one-handed mobile use** — large targets, bottom actions, short flows
- **graceful failure** — offline, GPS issues, and AI failure should not break the experience

## 2. Current design audit

The current design is already strong in a few areas:

- clean Apple-like civic palette in `src/index.css`
- soft surfaces and clear cards
- good mobile-first bottom navigation
- simple reporting flow shape
- restrained motion and decent visual hierarchy

But from a senior PWA UX perspective, these are the main issues:

### 2.1 What feels good already

- The visual language is calm and modern.
- The floating report CTA is memorable.
- Cards and badges already create a clean hierarchy.
- The app feels installable and mobile-native enough for a PWA.

### 2.2 What is not user-friendly enough yet

1. **The home page is too generic**
   - `Hello there` is warm, but not useful.
   - The product should immediately answer: what is happening nearby, what can I do now, what needs attention?

2. **The app over-signals AI too early**
   - “AI Insight” is visually prominent before trust and public accountability are proven.
   - The product should lead with community value, not AI branding.

3. **The report detail CTA is too casual**
   - “I’ve seen this too” is understandable, but weaker than the planned trust model.
   - “Confirm issue” is more civic, more neutral, and more scalable.

4. **Timeline language is still system-ish**
   - Users care about “received / routed / acknowledged / fixed / not fixed,” not internal workflow nuance.

5. **The map experience may be too map-heavy for mobile**
   - On small screens, users often understand a list faster than a map.
   - Map should support discovery, not dominate the experience.

6. **The identity verification flow needs softer framing**
   - National ID + selfie should feel optional and trust-building, not invasive.

7. **The product needs stronger civic trust signals**
   - Resolution proof, reopen flows, and moderation status need clearer visual treatment.

## 3. Revised design principles

### 3.1 Utility over novelty

Every important screen should answer one of these questions fast:

- What happened?
- Where is it?
- How serious is it?
- Who is handling it?
- Is it fixed yet?

### 3.2 Calm civic trust

The app should feel:

- dependable
- neutral
- public-interest oriented
- not gamified
- not noisy

This means:

- use restrained color for status
- avoid social-media metaphors
- keep “proof” and “tracking” visually important

### 3.3 Mobile thumb-first interaction

Primary actions should stay in easy thumb zones:

- bottom CTA areas
- large segmented toggles
- clear back/next navigation
- minimal top-right action clutter

### 3.4 Progressive disclosure

Show the simplest explanation first.

Example:

- Show `Resolved`
- Then show `Proof uploaded by City Engineering Office`
- Then show `Override reason` or `community reopened the case`

Do not overload the first layer with system metadata.

### 3.5 PWA realism

This is not a native app. Design must account for:

- intermittent connections
- install prompts being optional
- browser permission failure
- slower devices

## 4. Recommended product positioning in the UI

The interface should consistently communicate this:

**Report road issues fast. Track them publicly. Help your community confirm what is still unresolved.**

Avoid overemphasizing:

- “AI-powered” headlines
- complicated agency/government language on first touch
- identity verification before the user sees value

## 5. Design system direction

## 5.1 Visual style

Keep the current aesthetic direction:

- minimal / clean
- warm near-white backgrounds
- soft card surfaces
- one civic blue accent
- semantic urgency colors

But tighten it for a more useful PWA feel.

### Recommended feel

- **base mood:** calm, civic, mobile, trustworthy
- **accent mood:** precise and responsive, not flashy
- **motion:** subtle and purposeful

## 5.2 Color guidance

The current palette is good. Keep it, but use it with stricter rules.

### Recommended usage

- **Primary blue** → create report, active state, helpful system guidance
- **Red / urgent** → danger, reopened, high-risk hazards
- **Orange** → in progress / moderate caution
- **Green** → resolved / community verified
- **Gray** → submitted / passive metadata

### New rule

Do not use the primary blue to make everything feel important.
Reserve it for:

- main CTA
- active navigation
- helpful status cues
- trusted assistant features

## 5.3 Typography

The existing system stack is right for the product.

Use this hierarchy more intentionally:

- **H1 / page titles:** 24–28px, semibold
- **section titles:** 16–18px, semibold
- **body:** 15–16px
- **meta / status / helper text:** 12–13px

### Copy rule

Prefer plain-language civic copy over startup copy.

Good:

- `Confirm issue`
- `Still unresolved`
- `Proof uploaded`
- `Waiting for acknowledgment`

Less good:

- `Engage`
- `AI-reviewed incident lifecycle`
- `Leverage community validation`

## 5.4 Spacing and density

Current spacing is generally good. Keep the product airy, but not luxurious.

Recommended mobile rhythm:

- 16px outer padding default
- 12px between related controls
- 20–24px between screen sections
- 48px+ vertical breathing room only on onboarding/empty states

The app should feel **compact enough to be efficient**, not sparse for its own sake.

## 5.5 Shape and surfaces

Keep rounded corners, but standardize their meaning:

- **pill / full round** → navigation chips, badges
- **rounded-xl** → inputs and small controls
- **rounded-2xl** → cards and main surfaces
- **rounded-3xl** → onboarding illustrations, empty states, special civic moments only

## 6. Revised information architecture

## 6.1 Bottom navigation

Keep the current bottom nav structure, but tighten semantics:

- Home
- Map
- Track
- Profile
- center floating CTA: Report

### Recommendation

Keep the center report button, but make sure the app also has a **visible text CTA** on Home.

Why:

- floating icon buttons are memorable
- but first-time users still need explicit wording

## 6.2 Screen order for the core citizen journey

Recommended first-run path:

1. Splash
2. Onboarding
3. Home
4. Report flow
5. AI/processing state if needed
6. Report submitted confirmation
7. Public report detail / tracking page

### Recommendation

After submit, do **not** send users directly into a technical “analysis” feeling unless it is fast and useful.

Better sequence:

- short processing state
- then immediate reassurance:
  - tracking ID
  - status = Submitted / Reviewed
  - next expected action

## 7. Revised screen-by-screen UX direction

## 7.1 Splash

### Keep

- simple logo reveal
- short delay

### Improve

- Keep the brand line practical, not slogan-heavy.

Recommended supporting copy:

`Report road issues. Track real progress.`

Current `Safer roads, together.` is good as a secondary brand line, but not strong enough as the only message.

## 7.2 Onboarding

Current direction is close, but slide 3 overpromises AI routing too early.

### Recommended onboarding structure

1. **Report in minutes**  
   Snap a photo, add location, send it.

2. **Track what happens next**  
   See when it’s reviewed, routed, and resolved.

3. **Help confirm what’s still unresolved**  
   Your community can confirm issues and reopen false fixes.

### Why this is better

- stronger trust framing
- less dependence on AI as the hero
- better aligned with actual public value

## 7.3 Home

This screen needs the biggest UX improvement.

### Current problem

- greeting is generic
- AI insight is too prominent
- recent reports are useful but not prioritized enough

### Recommended Home structure

1. **Context header**
   - location-aware title if available
   - example: `Road issues near Barangay Poblacion`
   - fallback: `Road issues near you`

2. **Primary report CTA card**
   - keep prominent
   - include “2 minutes” and “photo + location” reassurance

3. **Urgent nearby list**
   - 2–3 active issues that need attention
   - more useful than generic recent activity

4. **Your recent reports**
   - personal accountability and progress

5. **Community / assistant insight**
   - AI or insight card demoted below core actions

### Home copy recommendation

Replace:

- `Hello there`
- `What’s happening on the roads near you?`

With:

- `Road issues near you`
- `Report a hazard or track what’s still unresolved`

## 7.4 Public map

### Recommendation

On mobile, do not force map-first interaction.

Use a **Map / List** segmented toggle.

Default mobile behavior:

- open to **List** if the user came from Home
- open to **Map** only if the user explicitly tapped `View map`

### Why

- lists are faster to scan on small screens
- maps are better for exploration, not for first comprehension

### Recommended mobile map card content

- issue category
- exact status
- severity
- barangay / landmark
- confirm count
- `View case` CTA

## 7.5 Report flow

The current 3-step structure is right.

### Keep

- photo first
- location second
- category + note third

### Improve

#### Step 1: Photo

- Add microcopy: `A clear photo helps reviewers and nearby residents verify the issue.`
- Allow retake/reselect without confusion
- Show supported issue examples subtly, not as clutter

#### Step 2: Location

- Make permission state explicit:
  - `Use my current location`
  - `Place pin manually`
- Reassure users that location can be adjusted

#### Step 3: Details

- Default to **4 main categories only** in MVP
- Put `Other` behind “More options,” not in the first visible row
- Help users write useful notes:
  - `What did you see?`
  - `How dangerous is it?`
  - `What nearby landmark helps locate it?`

### New UX recommendation

Add a **sticky bottom action bar** for:

- Continue
- Submit report

This is better than relying on the bottom of long content on smaller devices.

### Important behavior

- show `Draft saved` quietly when auto-saving
- do not use scary offline error language

## 7.6 Post-submit confirmation

This screen is currently underdefined and needs to feel reassuring.

### Recommended content

- `Report submitted`
- tracking ID
- location summary
- status = `Submitted`
- what happens next:
  - `We’ll review the report and route it to the likely office.`
- actions:
  - `Track this case`
  - `View public page`
  - `Report another issue`

This is one of the most important trust screens in the product.

## 7.7 Track

Current structure is fine, but filtering should use clearer mental models.

### Recommended tabs

- `All`
- `Open`
- `Resolved`

### Card improvements

- Show status first, then severity
- Show time since last update
- Show whether proof exists when resolved

### Why

Users want progress, not just metadata.

## 7.8 Report detail

This is the most trust-critical citizen screen.

### Current issues

- confirm CTA language is too casual
- timeline feels system-generated
- proof and reopen behavior need stronger visual hierarchy

### Recommended layout order

1. Title + category + location
2. Status + severity
3. Main evidence photo(s)
4. Public summary
5. Primary community action
6. Status timeline
7. Resolution proof / override reason
8. Map

### Recommended primary action copy

- `Confirm issue`
- helper text: `Use this if you saw the same issue recently.`

Secondary actions:

- `Still unresolved`
- `View proof`

### Timeline language

Use plain notes such as:

- `Report received`
- `Reviewed and categorized`
- `Routed to City Engineering Office`
- `Acknowledged by agency`
- `Marked resolved with proof`
- `Reopened by community`

### Proof section

Resolved cases should visually show one of two states:

1. **Proof uploaded**
   - after photo
   - who uploaded it
   - when it was uploaded

2. **Resolved with manual override**
   - show override reason in a neutral warning card
   - do not hide the fact that proof is missing

## 7.9 Profile

The current Profile page is too generic for the planned trust model.

### Recommended sections

1. **Identity and trust card**
   - Unverified / Pending review / Verified
   - explanation of why verification helps

2. **Contribution stats**
   - reports filed
   - issues confirmed
   - resolved cases followed

3. **Trust & verification**
   - upload National ID
   - capture selfie
   - review status

4. **Notifications**
5. **About / help**

### Important framing

Do not present verification as surveillance.

Use framing like:

`Verification helps reduce duplicate accounts and improve trust in reports and confirmations.`

## 7.10 Identity verification prototype

This flow must feel careful and optional.

### Recommended UX structure

1. Why verify?
2. What will be collected?
3. Upload ID
4. Take selfie
5. Submit for review
6. See status

### Must-have UX content

- why this is optional
- what data is stored
- who can review it
- that it is prototype-only for pilot trust

### Tone

- calm
- respectful
- privacy-aware
- non-threatening

## 7.11 Agency dashboard

The agency side should feel operational, not decorative.

### Recommended hierarchy

1. Overdue / urgent cases first
2. Cases needing acknowledgment
3. Cases awaiting proof or review
4. Map as supporting tool, not the only navigation model

### Recommended improvements

- Add quick filters: `Urgent`, `Awaiting acknowledgment`, `Needs proof`, `Reopened`
- Show proof-missing warning clearly on resolved items
- Show routing confidence only to staff, not as dominant public UI

## 7.12 Agency case detail

This screen should enforce good operational behavior.

### Recommended additions

- status update controls
- required proof upload area when resolving
- required override reason if proof is skipped by authorized user
- internal notes clearly separated from public timeline

### Visual rule

Public information and internal staff information should never feel mixed together.

## 8. Recommended component rules

## 8.1 Buttons

### Primary button

- full-width on mobile for key actions
- minimum height around 48px
- one primary action per screen section

### Secondary button

- neutral surface
- used for supportive actions only

### Destructive / caution usage

- reserve red for destructive or high-risk states
- do not make all important actions red/orange

## 8.2 Status badges

Keep badges, but reduce their visual weight when too many appear together.

Rule:

- maximum 2 badges in the first line of a mobile card
- avoid stacking severity + status + category + trust all at once

## 8.3 Cards

Every card should answer one job clearly.

Examples:

- report summary card
- proof card
- verification card
- urgent issue card

Avoid “mixed-purpose” cards with too many concepts.

## 8.4 Empty states

Current empty states are visually clean.

Improve them with more utility:

- explain what the user can do next
- give one CTA only
- avoid vague emotional filler

## 8.5 Toasts and feedback

Use short, confirmation-style language.

Good:

- `Report saved as draft`
- `Issue confirmed`
- `Proof uploaded`

Avoid:

- `Success!`
- `Operation completed`

## 9. Content design recommendations

## 9.1 Tone of voice

Use:

- plain
- civic
- respectful
- direct

Avoid:

- hype
- startup jargon
- overly technical system wording

## 9.2 Label recommendations

Replace or prefer:

- `I've seen this too` → `Confirm issue`
- `AI Insight` → `Area insight` or `Local insight`
- `Hello there` → `Road issues near you`
- `Track` → `My reports` or keep `Track` but use better subtitle
- `Urgency levels` → `How priority works`

## 9.3 Status copy

Preferred public labels:

- Submitted
- Reviewed
- Routed
- Acknowledged
- In progress
- Resolved
- Reopened

Keep internal-only terms out of the first layer where possible.

## 10. Accessibility requirements

Minimum standard: **WCAG AA**.

Required:

- visible focus states
- 44x44 minimum touch targets where practical
- clear color contrast for badges and actions
- do not rely on color alone for severity/status
- map interactions must have list-based alternatives
- camera and upload steps need text-based instructions
- proof and verification states must be understandable by screen readers

## 11. PWA-specific design guidance

## 11.1 Install prompt

Use a **non-blocking install card**, not an aggressive modal.

Recommended placement:

- Home screen after first successful visit
- dismissible
- hidden once installed or dismissed recently

## 11.2 Offline behavior

Offline UX should be reassuring, not alarming.

Recommended patterns:

- slim offline banner
- auto-saved draft toast
- retry CTA on submission failure
- explain that tracking may update once connection returns

## 11.3 Permission handling

Do not assume camera or geolocation permission will be granted.

Design must always provide:

- manual pin placement
- upload-from-gallery fallback
- clear retry path

## 12. Motion and feedback

Keep motion subtle and useful:

- onboarding slide transitions
- status progress transitions
- card press feedback
- install prompt reveal

Avoid:

- animated clutter
- bouncing badges
- highly expressive gestures in civic workflows

Recommended durations:

- 150–200ms for taps and card feedback
- 200–250ms for transitions
- spring only for special emphasis

## 13. Design changes I recommend implementing first

These give the best UX return fastest.

### Priority 1

1. Revise Home hierarchy and copy
2. Simplify public status language everywhere
3. Change `I've seen this too` to `Confirm issue`
4. Add stronger post-submit confirmation screen
5. Make proof and reopen states visually obvious

### Priority 2

6. Add Map/List toggle for Public Map mobile UX
7. Add sticky bottom action bar in Report Flow
8. Add trust/verification card in Profile
9. Add explicit proof-required state in Agency Case Detail

### Priority 3

10. Demote AI branding and promote community/accountability framing
11. Add optional install card and better offline messaging
12. Add clearer staff filters in Agency Dashboard

## 14. Final recommendation

The current design foundation is good. Do **not** replace it.

What the product needs is not a visual reinvention. It needs a **UX sharpening pass**:

- less generic copy
- less AI-first emphasis
- clearer trust signals
- better mobile scanning
- stronger proof and reopen behaviors
- gentler, more optional trust-verification framing

If we do that well, the app will feel:

- faster
- more trustworthy
- more civic
- more installable as a daily-use PWA
- more valuable to both citizens and pilot partners
