export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { CHAT_COOKIE, createChatToken } from '@/lib/chat';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const GOOGLE_STATE_COOKIE = 'drj_google_oauth_state';

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Google redirects here with ?code=&state=. We exchange the code for tokens,
 * fetch the profile, upsert the account in chat_users (shared with chat),
 * and issue the same chat session cookie → user is signed in everywhere.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const errorCode = searchParams.get('error');
  if (errorCode) return NextResponse.redirect(`${origin}/login?error=google_${errorCode}`);

  if (!googleConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const cookieStore = await cookies();
  const savedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_STATE_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/login?error=google_state`);
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/user/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${origin}/login?error=google_token`);
    }

    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await infoRes.json();
    if (!infoRes.ok || !profile.email) {
      return NextResponse.redirect(`${origin}/login?error=google_profile`);
    }

    const db = await getDatabase();
    if (!db) return NextResponse.redirect(`${origin}/login?error=no_database`);

    // Google account identity = the email, stored in the same accounts collection
    const username = profile.email.toLowerCase();
    const users = db.collection('chat_users');
    await users.updateOne(
      { username },
      {
        $set: {
          provider: 'google',
          name: profile.name || profile.email,
          picture: profile.picture || null,
          lastLoginAt: new Date()
        },
        $setOnInsert: { username, createdAt: new Date() }
      },
      { upsert: true }
    );

    const token = createChatToken(username, 'user');
    cookieStore.set(CHAT_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // Google sign-in always remembered 30 days
    });

    return NextResponse.redirect(`${origin}/login?welcome=1`);
  } catch (_err) {
    return NextResponse.redirect(`${origin}/login?error=google_failed`);
  }
}
