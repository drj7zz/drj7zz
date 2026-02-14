export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getChatSession } from '@/lib/chat';
import { getAdminSession } from '@/lib/auth';

/**
 * Personal saved items (bookmarks) for the signed-in user:
 *   GET            → { items: [...] }
 *   POST { id, type, title, url } → add
 *   DELETE ?id=...  → remove
 */
async function getSession() {
  return (await getAdminSession()) || (await getChatSession());
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDatabase();
  if (!db) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });

  const items = await db.collection('saved_items')
    .find({ username: session.username })
    .sort({ at: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ source: 'mongodb', items });
}

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDatabase();
  if (!db) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  if (!id) return NextResponse.json({ error: 'Missing item id.' }, { status: 400 });

  const doc = {
    username: session.username,
    id,
    type: typeof body.type === 'string' ? body.type : 'blog',
    title: typeof body.title === 'string' ? body.title.slice(0, 300) : id,
    url: typeof body.url === 'string' ? body.url : '',
    at: new Date()
  };

  await db.collection('saved_items').updateOne(
    { username: doc.username, id: doc.id },
    { $set: doc },
    { upsert: true }
  );

  return NextResponse.json({ success: true, saved: true });
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDatabase();
  if (!db) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id param.' }, { status: 400 });

  await db.collection('saved_items').deleteOne({ username: session.username, id });
  return NextResponse.json({ success: true, saved: false });
}
