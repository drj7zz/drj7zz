export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';
import { getChatSession, getChatStores } from '../../../../lib/chat';
import { getAdminSession } from '../../../../lib/auth';

/**
 * GET                → my thread (chat user)      | ?threads=1 → all threads (admin) | ?user=x → thread (admin)
 * POST { text }      → send as chat user          | { text, user } → reply as admin
 * DELETE             → clear own thread (chat)    | ?user=x → clear user thread (admin)
 */
export async function GET(request) {
  const db = await getDatabase();
  const { messages, source } = getChatStores(db);

  const admin = await getAdminSession();
  const chat = await getChatSession();
  const { searchParams } = new URL(request.url);

  if (admin) {
    if (searchParams.get('threads')) {
      const threads = await messages.aggregate([
        { $sort: { at: -1 } },
        { $group: { _id: '$username', last: { $first: '$$ROOT' }, count: { $sum: 1 } } },
        { $sort: { 'last.at': -1 } }
      ]).toArray();
      return NextResponse.json({ source, threads: threads.map(t => ({
        username: t._id,
        lastMessage: t.last.text,
        lastFrom: t.last.from,
        lastAt: t.last.at,
        count: t.count
      })) });
    }
    const user = searchParams.get('user');
    if (user) {
      const msgs = await messages.find({ username: user.trim().toLowerCase() }).sort({ at: 1 }).limit(500).toArray();
      return NextResponse.json({ source, messages: msgs });
    }
    if (chat) {
      const msgs = await messages.find({ username: chat.username }).sort({ at: 1 }).limit(500).toArray();
      return NextResponse.json({ source, messages: msgs });
    }
    const adminThread = (admin.user || 'admin').toLowerCase();
    const msgs = await messages.find({ username: adminThread }).sort({ at: 1 }).limit(500).toArray();
    return NextResponse.json({ source, messages: msgs });
  }

  if (chat) {
    const msgs = await messages.find({ username: chat.username }).sort({ at: 1 }).limit(500).toArray();
    return NextResponse.json({ source, messages: msgs });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request) {
  const db = await getDatabase();
  const { messages } = getChatStores(db);

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

  let doc;
  const recipientValue = body.recipient ?? body.user ?? body.username;
  const hasRecipient = typeof recipientValue === 'string' && recipientValue.trim();

  if (hasRecipient && admin) {
    const user = recipientValue.trim().toLowerCase();
    if (!user) return NextResponse.json({ error: 'Missing user to reply to.' }, { status: 400 });
    doc = { username: user, from: 'admin', text, at: new Date() };
  } else if (chat) {
    doc = { username: chat.username, from: 'user', text, at: new Date() };
  } else if (admin) {
    const user = (admin.user || 'admin').toLowerCase();
    doc = { username: user, from: 'admin', text, at: new Date() };
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await messages.insertOne(doc);
  return NextResponse.json({ success: true, message: doc });
}

export async function DELETE(request) {
  const db = await getDatabase();
  const { messages } = getChatStores(db);

  const admin = await getAdminSession();
  const chat = await getChatSession();
  if (!admin && !chat) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const targetUser = searchParams.get('user');

  if (admin && targetUser) {
    await messages.deleteMany({ username: targetUser.trim().toLowerCase() });
    return NextResponse.json({ success: true, message: 'Thread cleared.' });
  }

  if (chat) {
    await messages.deleteMany({ username: chat.username });
    return NextResponse.json({ success: true, message: 'Your chat thread has been cleared.' });
  }

  if (admin) {
    const user = (admin.user || 'admin').toLowerCase();
    await messages.deleteMany({ username: user });
    return NextResponse.json({ success: true, message: 'Thread cleared.' });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
