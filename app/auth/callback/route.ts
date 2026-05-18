import { NextResponse } from 'next/server';

// Auth callback is no longer used for session management (replaced by membership-number login).
// Kept as a safety net in case Supabase sends any callback links.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}
