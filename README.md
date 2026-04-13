# Diploma Hotel

A hotel and property-booking application built with Next.js 15, React 19, NextAuth, Prisma, and MongoDB.

## Stack

- Next.js App Router
- TypeScript
- Prisma with MongoDB
- NextAuth credentials, Google, and GitHub providers
- Tailwind CSS
- Zustand cart state
- Cloudinary image uploads

## Core Features

- User registration and credential login
- Google and GitHub OAuth login
- Property listing creation and management
- Favorites, cart, checkout, and reservation flows
- Admin dashboard for users, listings, reservations, and analytics
- Route-level API authorization for admin and authenticated actions

## Requirements

- Node.js 20+
- npm
- MongoDB connection string

## Environment Variables

Create a local env file such as `.env.local` and define the values below.

```env
DATABASE_URL="mongodb+srv://..."
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

GITHUB_ID="..."
GITHUB_SECRET="..."

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-long-random-password"
ADMIN_NAME="Admin"
```

Notes:

- `DATABASE_URL` is required for Prisma and MongoDB access.
- `NEXTAUTH_SECRET` is required for session signing.
- `NEXTAUTH_URL` should match the deployed site URL in non-local environments.
- GitHub and Google provider keys are optional unless you want those login methods enabled.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is used by the image upload flow on the client.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are only required when running the admin bootstrap script.

## Prisma and MongoDB Setup

The Prisma schema is at [prisma/schema.prisma](/c:/Users/ankhb/diplom/prisma/schema.prisma).

This project uses Prisma's MongoDB provider. The datasource is configured from `DATABASE_URL` in source control and should stay environment-driven rather than hardcoded.

Useful commands:

```bash
npm install
npx prisma generate
```

There are no migration scripts in this repository. Schema changes need to be applied through your Prisma workflow for MongoDB.

## Local Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Authentication

Auth configuration lives in [app/lib/auth.ts](/c:/Users/ankhb/diplom/app/lib/auth.ts).

Supported providers:

- Credentials
- Google
- GitHub

Credentials auth checks `email` and `password` against the Prisma `User` model. Passwords are stored as bcrypt hashes.

## Admin Setup

Admin creation helper:

- [scripts/createAdmin.ts](/c:/Users/ankhb/diplom/scripts/createAdmin.ts)

Before using it, define secure bootstrap values in your environment.

Then run:

```bash
node scripts/createAdmin.ts
```

The script creates the admin user if missing, or updates the existing user to:

- `role: "admin"`
- a fresh hashed password
- a verified email timestamp
- the configured `ADMIN_NAME` value when creating a new admin user

## Project Structure

- [app/api](/c:/Users/ankhb/diplom/app/api): API routes for auth, listings, reservations, checkout, admin analytics, and user management
- [app/lib](/c:/Users/ankhb/diplom/app/lib): auth and shared server helpers
- [app/libs](/c:/Users/ankhb/diplom/app/libs): Prisma client singleton and other runtime utilities
- [app/components](/c:/Users/ankhb/diplom/app/components): UI components
- [prisma](/c:/Users/ankhb/diplom/prisma): Prisma schema
- [scripts](/c:/Users/ankhb/diplom/scripts): operational scripts such as admin bootstrapping

## Deployment Notes

- The app is configured as a standard Next.js server application.
- Image domains are defined in [next.config.ts](/c:/Users/ankhb/diplom/next.config.ts) for GitHub, Google, and Cloudinary-hosted images.
- Set the same environment variables in your hosting platform that you use locally.
- Only set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in environments where you intend to run the admin bootstrap script.
- Make sure `NEXTAUTH_URL` matches the deployed origin exactly.
- Make sure MongoDB is reachable from the deployment environment.
- Run `npx prisma generate` as part of your build pipeline if your platform does not already do so.

The current build script already does this:

```bash
npm run build
```

This executes:

```bash
prisma generate && next build
```

## Operational Notes

- Sensitive API routes now enforce authorization inside the route handlers and should not rely on middleware alone.
- Reservation creation validates date order and reservation conflicts on the server.
- Registration performs explicit password validation and duplicate-account checks before user creation.
- NextAuth debug logging is enabled only in development.

## Troubleshooting

- If auth fails unexpectedly, verify `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and your OAuth provider credentials.
- If Prisma cannot connect, verify `DATABASE_URL` and make sure the schema datasource is correctly configured.
- If image uploads fail, verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
- If admin pages load but admin actions fail, confirm the user record has `role: "admin"`.
