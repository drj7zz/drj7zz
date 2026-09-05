export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import {
  CHAT_COOKIE, chatConfigured, createChatToken,
  hashPassword, verifyPassword, getChatSession,
  getChatStores
} from '@/lib/chat';

/**
 * POST { action: 'register' | 'login', username, password, remember }
 * GET  → current chat session
 * DELETE → logout
 */
export async function POST(request) {
  if (!chatConfigured()) {
    return NextResponse.json({ error: 'Chat auth is not configured (JWT_SECRET missing).' }, { status: 503 });
  }
  const db = await getDatabase();
  const { users } = getChatStores(db);

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const action = body.action;
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = Boolean(body.remember);

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json({ error: 'Username must be 3–20 characters (letters, numbers, underscore).' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  if (action === 'register') {
    const existing = await users.findOne({ username });
    if (existing) {
      return NextResponse.json({ error: 'That username is already taken. Try logging in.' }, { status: 409 });
    }
    await users.insertOne({ username, passwordHash: hashPassword(password), createdAt: new Date() });
    return await issueSession(username, 'user', remember);
  }

  if (action === 'login') {
    const user = await users.findOne({ username });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 });
    }
    return await issueSession(username, 'user', remember);
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}

async function issueSession(username, role, remember) {
  const token = createChatToken(username, role);
  const cookieStore = await cookies();
  cookieStore.set(CHAT_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {})
    // no maxAge → session cookie → "remember me" off
  });
  return NextResponse.json({ success: true, user: { username, role } });
}

export async function GET() {
  const session = await getChatSession();
  return NextResponse.json({ user: session ? { username: session.username, role: session.role } : null });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(CHAT_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return NextResponse.json({ success: true });
}
