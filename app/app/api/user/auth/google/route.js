export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_STATE_COOKIE = 'drj_google_oauth_state';
const GOOGLE_RETURN_COOKIE = 'drj_google_oauth_return';

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri(request) {
  const url = new URL(request.url);
  return process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/user/auth/google/callback`;
}

/**
 * GET /api/user/auth/google → redirect the visitor to Google's consent screen.
 * GET /api/user/auth/google?status=1 → JSON config status (used by the login page).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('status')) {
    return NextResponse.json({ configured: googleConfigured() });
  }

  if (!googleConfigured()) {
    return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url));
  }

  // CSRF protection: random state stored in a short-lived cookie
  const state = crypto.randomBytes(24).toString('hex');
  const cookieStore = await cookies();
  const requestedReturn = searchParams.get('next');
  const returnPath = requestedReturn && requestedReturn.startsWith('/') && !requestedReturn.startsWith('//')
    ? requestedReturn
    : '/login';
  cookieStore.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600
  });
  cookieStore.set(GOOGLE_RETURN_COOKIE, returnPath, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(request),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account'
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
