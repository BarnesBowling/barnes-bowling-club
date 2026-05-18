# Barnes Bowling Club production starter

This is a production-ready Next.js starter converted from the uploaded Barnes Bowling Club HTML prototype. It replaces fake front-end-only payments, login and forms with real Supabase + Stripe architecture.

## Stack
- Next.js App Router route handlers for backend endpoints
- Supabase Auth, Postgres, RLS and Storage-ready schema
- Stripe Checkout and webhook fulfilment
- Server-rendered public pages, protected members/admin pages

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill values.
3. Create a Supabase project and run `supabase/schema.sql` in SQL Editor.
4. Create Stripe Products/Prices and paste their Price IDs into `.env.local`.
5. Run `npm run dev`.
6. Add a Stripe webhook endpoint pointing to `/api/stripe/webhook` and listen for `checkout.session.completed`.

## Important
- The custom card form from the prototype has been removed. All card handling happens on Stripe Checkout.
- Admin access is controlled by `profiles.role = 'admin'`. Set your admin user manually in Supabase after first login.
- The app uses Supabase RLS for member/admin data protection.
# rebuild
