export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { getChatSession } from '../../../../lib/chat';
import { getAdminSession } from '../../../../lib/auth';

/**
 * GET                → my thread (chat user)      | ?threads=1 → all threads (admin) | ?user=x → thread (admin)
 * POST { text }      → send as chat user          | { text, user } → reply as admin
 */
export async function GET(request) {
  const db = await getDatabase();
  if (!db) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });

  const admin = await getAdminSession();
  const chat = await getChatSession();
  const { searchParams } = new URL(request.url);
  const messages = db.collection('chat_messages');

  if (admin) {
    if (searchParams.get('threads')) {
      const threads = await messages.aggregate([
        { $sort: { at: -1 } },
        { $group: { _id: '$username', last: { $first: '$$ROOT' }, count: { $sum: 1 } } },
        { $sort: { 'last.at': -1 } }
      ]).toArray();
      return NextResponse.json({ source: 'mongodb', threads: threads.map(t => ({
        username: t._id,
        lastMessage: t.last.text,
        lastFrom: t.last.from,
        lastAt: t.last.at,
        count: t.count
      })) });
    }
    const user = searchParams.get('user');
    if (!user) return NextResponse.json({ error: 'Missing user param.' }, { status: 400 });
    const msgs = await messages.find({ username: user }).sort({ at: 1 }).limit(500).toArray();
    return NextResponse.json({ source: 'mongodb', messages: msgs });
  }

  if (chat) {
    const msgs = await messages.find({ username: chat.username }).sort({ at: 1 }).limit(500).toArray();
    return NextResponse.json({ source: 'mongodb', messages: msgs });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request) {
  const db = await getDatabase();
  if (!db) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });

  const admin = await getAdminSession();
  const chat = await getChatSession();
  if (!admin && !chat) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2000) : '';
  if (!text) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });

  const messages = db.collection('chat_messages');
  let doc;
  if (admin) {
    const user = typeof body.user === 'string' ? body.user.trim().toLowerCase() : '';
    if (!user) return NextResponse.json({ error: 'Missing user to reply to.' }, { status: 400 });
    doc = { username: user, from: 'admin', text, at: new Date() };
  } else {
    doc = { username: chat.username, from: 'user', text, at: new Date() };
  }

  await messages.insertOne(doc);
  return NextResponse.json({ success: true, message: doc });
}
