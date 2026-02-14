import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
export const CHAT_COOKIE = 'drj_chat_token';

export function chatConfigured() {
  return Boolean(JWT_SECRET);
}

export function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

export function verifyPassword(password, hash) {
  try {
    return bcrypt.compareSync(String(password), String(hash));
  } catch (_err) {
    return false;
  }
}

/**
 * Sign a chat session token. role is 'user' or 'admin'.
 * remember=true → 30 days, otherwise a session cookie (browser close).
 */
export function createChatToken(username, role) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ username, role: role || 'user', kind: 'chat' }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyChatToken(token) {
  if (!JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.kind !== 'chat') return null;
    return payload;
  } catch (_err) {
    return null;
  }
}

export async function getChatSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CHAT_COOKIE)?.value;
  if (!token) return null;
  return verifyChatToken(token);
}
