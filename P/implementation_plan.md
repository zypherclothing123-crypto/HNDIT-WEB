# Migrate from Supabase Auth to Clerk

This plan outlines the complete removal of Supabase Authentication in favor of Clerk Authentication across the application. Since Supabase is heavily used as the database for the application, this migration requires replacing the auth implementation while keeping the database functioning correctly.

## User Review Required

> [!WARNING]
> **Supabase Database Row Level Security (RLS)**
> Removing Supabase Auth means that the Supabase client will no longer automatically send the user's `auth.uid()` to your database. If your Supabase database has Row Level Security (RLS) policies that depend on `auth.uid()` (e.g. `user_id = auth.uid()`), database queries will start failing after this migration.
>
> **How would you like to handle this?**
>
> - **Option A (Recommended for Production):** Create a Clerk JWT Template for Supabase. This requires configuring Clerk to generate a JWT that Supabase accepts, so RLS policies still work.
> - **Option B:** Bypass RLS by using the Supabase Service Role Key on the server side instead of the Anon Key. This relies on your Next.js server code for security rather than database RLS.
> - **Option C:** My Supabase tables are mostly public/unrestricted, so I don't need RLS auth mapping.

## Proposed Changes

### Setup Clerk

We will follow the instructions provided in your `clerk.md` guide:

- Run the `clerk init` command using your provided Clerk App ID to ensure everything is set up correctly in `package.json` and basic configurations.
- Verify `components.json` for shadcn/ui and install `@clerk/ui` if necessary.

### Application Layout & Middleware

---

#### [MODIFY] middleware.ts

Replace the custom Supabase cookie-checking middleware with Clerk's `clerkMiddleware()`. Configure the matcher to ensure the auto-proxy path (`/__clerk/:path*`) is correctly handled.

#### [MODIFY] app/layout.tsx

Wrap the application in `<ClerkProvider>`. If shadcn/ui is being used, apply the Clerk shadcn theme as instructed.

### Authentication UI & Modals

---

#### [MODIFY] components/landing/LandingAuthModal.tsx

Replace the manual Supabase email/password forms with Clerk's `<SignInButton />` and `<SignUpButton />`.

#### [MODIFY] components/layout/UserSidebar.tsx & AdminSidebar.tsx

Replace custom "Sign Out" buttons with Clerk's `<UserButton />` or `useAuth().signOut()` method.

### Backend APIs & Database Clients

---

#### [MODIFY] lib/supabase/server.ts & client.ts

Remove `@supabase/ssr` logic that reads/writes Supabase auth cookies. The clients will be simplified to just use standard `@supabase/supabase-js` for database operations. If Option A is chosen, we'll update these clients to inject the Clerk JWT into the Supabase headers.

#### [MODIFY] lib/supabase/api-auth.ts

Migrate server-side auth checks (e.g. validating users in API routes) from `supabase.auth.getSession()` to Clerk's `auth()` helper from `@clerk/nextjs/server`.

## Verification Plan

### Manual Verification

1. Run `clerk doctor` to ensure the project is configured correctly.
2. Start the app locally with `npm run dev` and navigate to the landing page.
3. Test signing up as a new user via Clerk.
4. Verify that the user icon appears in the navigation sidebar (via `<UserButton />`).
5. Check if dashboard data loads properly (verifying database connectivity/RLS integration).

## Login Details
admin - adminhndit@gmail.com
password - 123456
