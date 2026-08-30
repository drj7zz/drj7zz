export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';
import { socialLinks as seedLinks, facts as seedFacts, heroSignals as seedSignals } from '../../../lib/data';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        source: 'seed',
        data: {
          socialLinks: seedLinks,
          facts: seedFacts,
          heroSignals: seedSignals
        }
      });
    }

    const info = await db.collection('site_info').findOne({ key: 'main' });
    if (!info) {
      return NextResponse.json({
        source: 'seed',
        data: {
          socialLinks: seedLinks,
          facts: seedFacts,
          heroSignals: seedSignals
        }
      });
    }

    return NextResponse.json({ source: 'mongodb', data: info.data });
  } catch (_error) {
    return NextResponse.json({
      source: 'seed_fallback',
      data: {
        socialLinks: seedLinks,
        facts: seedFacts,
        heroSignals: seedSignals
      }
    });
  }
}

export async function PUT(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'MongoDB Atlas is not configured.' }, { status: 503 });
    }

    const result = await db.collection('site_info').updateOne(
      { key: 'main' },
      { $set: { key: 'main', data: body, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update site info' }, { status: 500 });
  }
}
