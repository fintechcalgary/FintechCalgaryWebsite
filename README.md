# FinTech Calgary

Official web platform for FinTech Calgary, a student-run financial technology association at the University of Calgary. The application supports public programming, partner engagement, membership workflows, and an internal operations dashboard for staff teams.

Production site: [https://fintechcalgary.ca](https://fintechcalgary.ca)

## Overview

FinTech Calgary connects students, industry partners, and the broader Calgary fintech community through events, B2B programs, and educational initiatives. This repository contains the full-stack Next.js application that powers the public website, member-facing flows, and role-based admin tools.

## Features

### Public website

- **Landing and about pages** — Organization overview, mission, executive team display, and calls to action for membership and partnerships.
- **Events** — Public event listings, event detail pages, image carousels, and attendee registration with email confirmation.
- **Community board** — Curated community and partner event posts with upcoming and past sections.
- **Partners** — Public partner directory, detail views, and an associate signup workflow (`/partner-signup`).
- **Membership** — Join flow with free and premium membership options, resume upload, and payment integration (Converge) for paid tiers.
- **Executive recruitment** — Seasonal executive application form when applications are enabled in site settings.
- **Insights** — Weekly digest of up to fifteen curated fintech articles, sentiment summaries, trending topics, and an AI-assisted chat experience grounded in the current digest.
- **Articles archive** — Searchable historical article collection separate from the weekly insights digest.
- **Contact and legal** — Contact form, privacy policy, and terms pages.

### Staff dashboard

Access is restricted to staff accounts (`admin`, `outreach`, `finance`, `events`, `marketing`, `projects`) with per-role permissions. Associate (partner) accounts use a separate partner dashboard.

| Area | Capabilities |
| --- | --- |
| Events | Create, edit, and manage FinTech Calgary events and registrations. |
| Community | Publish and moderate community board posts. |
| Executives | Manage executive profiles, ordering, and role metadata. |
| Executive applications | Review and approve or reject incoming executive applications. |
| Members | Manage membership records. |
| Partners | Review partner applications and manage public partner listings. |
| Contracts | Track partnership contracts through a multi-stage pipeline with expressions of interest. |
| Marketing | Submit content for approval and review pending marketing submissions (role-dependent). |
| Documentation | Internal document library with finance-specific access controls. |
| Users | Admin-only user and role management. |

### Partner dashboard

Authenticated associate accounts can view application status, maintain organization profile information, and manage partner-submitted events.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS, custom design tokens, Framer Motion |
| Data | MongoDB |
| Authentication | NextAuth.js (Google OAuth and credentials) |
| Media | Cloudinary |
| Email | SendGrid (subscriptions, event registration), Mailgun (contact form) |
| AI | Groq API (article summaries, insights chatbot) |
| Analytics | Vercel Analytics |
| Testing | Vitest |
| Deployment | Vercel (scheduled cron jobs via `vercel.json`) |

## Project structure

```
src/
├── app/              # App Router pages, layouts, and API routes
├── components/       # Shared UI and layout components
├── contexts/         # React context providers
├── features/         # Domain-specific UI (events, partners, insights, etc.)
├── hooks/            # Client hooks
├── lib/              # Shared utilities, permissions, models, API helpers
├── scripts/          # Database seeds and maintenance scripts
└── styles/           # Global CSS layers (forms, motion, typography)
```

API routes live under `src/app/api/`. Permission checks are centralized in `src/lib/permissions.js`.

## Getting started

### Prerequisites

- Node.js 18 or later
- MongoDB database (local or hosted)
- Accounts and API keys for integrations you intend to use (see Environment variables)

### Installation

```bash
npm install
```

### Environment variables

Create `.env.local` in the project root. Do not commit secrets to version control.

**Required for core functionality**

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Session signing secret for NextAuth.js |
| `NEXTAUTH_URL` | Canonical site URL (e.g. `http://localhost:3000` in development) |

**Authentication**

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

**Email**

| Variable | Purpose |
| --- | --- |
| `SENDGRID_API_KEY` | Outbound mail for subscriptions and event registration |
| `MAILGUN_API_KEY` | Contact form delivery |
| `MAILGUN_DOMAIN` | Mailgun sending domain |

**Media uploads**

| Variable | Purpose |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

**Weekly insights pipeline**

| Variable | Purpose |
| --- | --- |
| `CRON_SECRET` | Authorizes scheduled and manual digest refresh requests |
| `GROQ_API_KEY` | Article summarization during weekly refresh (recommended) |
| `GROQ_MODEL` | Optional Groq model override (defaults to `openai/gpt-oss-20b`) |

**Membership payments (premium join tier)**

| Variable | Purpose |
| --- | --- |
| `CONVERGE_BASE_URL` | Elavon Converge API base URL |
| `CONVERGE_MERCHANT_ID` | Converge merchant identifier |
| `CONVERGE_USER_ID` | Converge API user ID |
| `CONVERGE_PIN` | Converge API PIN |

**Staff account seeding** (local or staging only; set in `.env.local`)

| Variable | Purpose |
| --- | --- |
| `SEED_ADMIN_PASSWORD` | Password for the `fintechcalgary` admin account |
| `SEED_OUTREACH_PASSWORD` | Password for the `outreach` account |
| `SEED_FINANCE_PASSWORD` | Password for the `finance` account |
| `SEED_EVENTS_PASSWORD` | Password for the `events` account |
| `SEED_MARKETING_PASSWORD` | Password for the `marketing` account |
| `SEED_PROJECTS_PASSWORD` | Password for the `projects` account |

### Development

```bash
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000) with the webpack bundler.

**Testing on a phone (same Wi‑Fi):**

```bash
npm run serve
```

This starts the dev server on port **8080**, binds to all interfaces (`0.0.0.0`), and copies your LAN URL to the clipboard (for example `http://192.168.1.42:8080`). **Use only on trusted Wi‑Fi** — other devices on the network can access the unauthenticated dev server. On your phone, use only that IP address; Safari refuses `http://0.0.0.0`. Override with `HOST_LAN=192.168.1.42` (IPv4 only) or `PORT=3080` if needed.

Other scripts:

| Command | Description |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (zero warnings enforced) |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run seed-staff-roles` | Create or update staff RBAC accounts from env passwords |
| `npm run seed-partners` | Seed partner records |
| `npm run upload-partner-logos` | Upload partner logos to Cloudinary |
| `npm run list-users` | List users in the database |

## Authentication and authorization

Authentication is handled by NextAuth.js with JWT sessions. Supported sign-in methods:

- Google OAuth
- Username and password (credentials provider, bcrypt-hashed passwords in MongoDB)

**Staff roles:** `admin`, `outreach`, `finance`, `events`, `marketing`, `projects`

**Other roles:** `member`, `associate` (approved partner organizations)

Each staff role is granted a subset of dashboard routes and API permissions defined in `src/lib/permissions.js`. Administrators have full access. API routes enforce permissions server-side; the dashboard UI hides unauthorized sections client-side.

Staff accounts for local development can be provisioned with:

```bash
npm run seed-staff-roles
```

## Weekly insights digest

The Insights page displays the current weekly digest (maximum fifteen articles). The Articles page retains the full historical archive.

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/insights/current` | GET | Returns the active weekly digest |
| `/api/articles/refresh` | POST | Rebuilds the digest (cron-protected) |

**Scheduled refresh:** Vercel cron invokes `/api/articles/refresh` every Friday at 06:00 UTC (`0 6 * * 5` in `vercel.json`). Requests must include the `CRON_SECRET` bearer token.

**Digest behavior:**

- The insights view shows only the current weekly digest (up to fifteen items).
- If fewer than fifteen articles qualify for the week, remaining slots are filled from the most relevant recent historical articles.
- When `GROQ_API_KEY` is configured, the refresh pipeline can generate article summaries via Groq.

Digests are stored in the `weekly_digests` MongoDB collection.

## Deployment

The application is designed for deployment on Vercel with:

- Serverless API routes
- MongoDB as the external database
- Cloudinary for image assets
- Cron-based article refresh

Before a production release, verify that SendGrid sender authentication and domain alignment are complete for all from-addresses used in transactional email.

## Testing

Unit and integration tests use Vitest. Test files are colocated with source (e.g. `*.test.js`) and under `src/lib/`. Run the suite with:

```bash
npm run test
```

## License and maintenance

This project is maintained by FinTech Calgary. For questions about the platform or contributing, contact the organization through the site contact form or official channels listed on [fintechcalgary.ca](https://fintechcalgary.ca).