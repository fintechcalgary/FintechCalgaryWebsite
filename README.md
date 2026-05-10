# FinTech Calgary

A modern web platform for Calgary's FinTech community. Built with Next.js, this platform facilitates event management, team collaboration, and community engagement.

## Verify the official FinTech email on sendgrid before releasing the website

## 🚀 Features

- **Event Management**

  - Create and manage events
  - Event registration system
  - Automated registration tracking
  - Event image upload support

- **Team Management**
  - Member profiles with roles
  - Secure authentication system
  - Profile image management
  - Role-based access control

## 🛠️ Tech Stack

- **Frontend**

  - Next.js 15.0
  - React 18
  - Framer Motion
  - TailwindCSS

- **Backend**
  - MongoDB
  - NextAuth.js
  - Cloudinary (Image hosting)
  - bcrypt (Password hashing)

## 🔒 Authentication

The platform uses NextAuth.js for authentication with the following features:

- Email/Password authentication
- Role-based authorization
- Secure session management
- Protected API routes

## 👥 Team

- Project maintained by FinTech Calgary

## Weekly Insights Digest (15 Articles)

The Insights page is now driven by a weekly digest pipeline that enforces exactly 15 most relevant articles.

- Current digest endpoint: `GET /api/insights/current`
- Weekly digest storage: `weekly_digests` collection
- Weekly refresh endpoint: `POST /api/articles/refresh`
- Friday refresh schedule (UTC): `0 6 * * 5` via `vercel.json`

Behavior:

- Insights page displays only the current weekly digest (max 15).
- Articles page remains the historical archive of all collected articles.
- If fewer than 15 articles are available in the week, the digest fills from the most recent relevant historical articles.

Required environment variables:

- `MONGODB_URI`
- `CRON_SECRET`
- `GEMINI_API` (optional but recommended for summary generation)
