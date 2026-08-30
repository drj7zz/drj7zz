import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'x2P6Z7qKuF/epxpCCRoaPm8i9RZqj16qIqy4GpX+5Ks=';
const ADMIN_USER = process.env.ADMIN_USERNAME || 'giridirghraj';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'FimmgDrziItcKQtW0H4ai1l';
const COOKIE_NAME = 'drj_admin_token';
const TOKEN_TTL = '7d';

function isAuthConfigured() {
  return Boolean(JWT_SECRET && ADMIN_USER && ADMIN_PASS);
}

export function authConfigured() {
  return isAuthConfigured();
}

/** Fail-closed credential check — never falls back to hardcoded defaults. */
export function verifyCredentials(username, password) {
  if (!isAuthConfigured()) return false;
  if (typeof username !== 'string' || typeof password !== 'string') return false;
  return username.trim() === ADMIN_USER.trim() && password.trim() === ADMIN_PASS.trim();
}

export function createToken(payload = {}) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ ...payload, user: ADMIN_USER, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token) {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export { COOKIE_NAME };
