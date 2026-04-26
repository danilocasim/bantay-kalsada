# Bisto

Bisto is a PWA-first community road reporting platform designed to help citizens report road hazards quickly, track them publicly, and encourage accountable follow-through from the appropriate office or response team.

The project focuses on a simple but high-value civic workflow:

- report a road issue with a photo and location
- track what happens next through a public status flow
- let nearby residents confirm unresolved issues
- support agency-side updates with proof-based resolution

## Submission Links

- GitHub Repository: `https://github.com/danilocasim/bantay-kalsada`
- Working Application:
  - Installable PWA from this repository
  - Local run: `npm install && npm run dev`
  - Production build: `npm run build`
  - Deployed URL: `Add deployed URL here if available`
- Team Devpost Accounts:
  - `Add team member Devpost profile URL here`
  - `Add team member Devpost profile URL here`
  - `Add team member Devpost profile URL here`

## Overview

Road hazards are often seen by the community before they are formally acted on. Bantay Kalsada helps bridge that gap by turning scattered reports into structured, trackable cases.

The application is built around three connected experiences:

1. Citizen reporting flow
2. Public map and tracking experience
3. Agency or moderator review workflow

The current version is designed as a mobile-first, installable Progressive Web App so it can be tested quickly in a real community setting without requiring native iOS or Android releases.

## Core Features

- Mobile-first photo and location-based road issue reporting
- Public report detail pages with status timeline
- Community confirmation for unresolved issues
- Resolution proof workflow for agency updates
- AI-assisted category, severity, and routing suggestions
- Category-aware map markers for public and agency maps
- Offline-aware draft handling for report submission
- Optional prototype trust verification flow for pilot users
- 20-day unresolved escalation prompt with a prepared 8888 email draft

## Working Application

This repository contains a working application that can be run and built locally.

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

### Installable PWA

The app is configured as a Progressive Web App using `vite-plugin-pwa`, which means it can be installed from supported browsers as an app-like experience.

### Firebase-Backed Mode

The application supports live Firebase-backed behavior when the required `VITE_FIREBASE_*` environment variables are configured.

See:

- `.env.example`
- `firebase/README.md`

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI primitives
- Framer Motion
- React Leaflet / Leaflet

### Backend / Platform

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions

### AI and Geospatial

- Gemini API via Firebase Cloud Functions
- `geofire-common` for geospatial helpers
- OpenStreetMap tiles via Leaflet

### Testing

- Vitest
- Testing Library

## Repository Structure

```text
.
├── docs/                     # product, implementation, and design docs
├── firebase/                 # Firestore rules, Storage rules, and Cloud Functions
├── public/                   # static assets and PWA files
├── src/
│   ├── components/           # shared UI and interaction components
│   ├── lib/                  # Firebase, data, reporting, escalation, and map helpers
│   ├── pages/                # citizen, public, and agency screens
│   └── test/                 # test setup
└── README.md
```

## Product Status

The project currently includes:

- a working PWA shell
- live Firebase report creation and reads when configured
- AI-assisted report review flow
- public tracking and community confirmation
- agency case updates with proof-based resolution UX

Some areas remain intentionally scoped as pilot or prototype behavior, including:

- advanced routing logic
- production-grade identity verification
- fully persistent in-app notifications
- broader jurisdiction coverage beyond an early pilot setup

## Setup Notes

### Frontend Environment Variables

Use the values in `.env.example` as the starting point.

Required for live Firebase mode:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_FIREBASE_VAPID_KEY`
- `VITE_8888_EMAIL`

### Firebase Backend

The Firebase backend configuration, rules, and function setup instructions are documented in:

- `firebase/README.md`

## Credits

This project uses the following tools, frameworks, and resources:

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Framer Motion
- Firebase
- Leaflet
- React Leaflet
- Lucide Icons
- Vitest
- Testing Library
- OpenStreetMap
- Gemini API
- Lovable for initial project scaffolding

## Documentation

Additional project documentation is available in:

- `docs/Startup Concept.md`
- `docs/plan.md`
- `docs/design.md`

## Team

### Project Name

`Bisto`

### Team Members

- `Danilo Casim Jr`
- `Myrine Angela Agustin`
- `Christian Mark Francisco`
- `Karen Pabilando`

### Devpost Profiles

- [Danilo's Profile](https://devpost.com/danilocasim)
- [Christian's Profile](https://devpost.com/margiehouses)
- [Myrine's Profile](https://devpost.com/myangelaagustin)
- [Karen's Profile](https://devpost.com/pabilando-karenpv)

## License

Add a project license here if you want to publish one explicitly.
