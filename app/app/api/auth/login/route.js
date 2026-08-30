export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { verifyCredentials, createToken, authConfigured, COOKIE_NAME } from '../../../../lib/auth';

// Simple in-memory rate limiter: max 5 attempts per IP per 15 minutes.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  attempts.set(ip, entry);
  // Opportunistic cleanup to avoid unbounded growth
  if (attempts.size > 500) {
    for (const [key, val] of attempts) {
      if (now > val.resetAt) attempts.delete(key);
    }
  }
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request) {
  try {
    if (!authConfigured()) {
      return NextResponse.json(
        { error: 'Admin authentication is not configured on this server. Set ADMIN_USERNAME, ADMIN_PASSWORD and JWT_SECRET.' },
        { status: 503 }
      );
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (!verifyCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = createToken({ user: username, role: 'admin' });

    const response = NextResponse.json({ success: true, user: username });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    attempts.delete(ip); // reset on success
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
