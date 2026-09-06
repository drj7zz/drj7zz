export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';
import { facts as seedFacts, skills as seedSkills, careerStrengths as seedStrengths } from '../../../lib/data';

const DEFAULT_PROFILE = {
  headline: 'Designed to be useful. Built to last.',
  intro:
    'I work where frontend engineering meets visual clarity. My goal is to create web interfaces that communicate quickly, adapt gracefully across devices, and remain easy for teams to evolve.',
  kaalyugNote:
    'Founder of KAALYUG: an open-source web initiative engineering practical browser tools, decentralized financial interfaces, and high-performance digital systems built for accessibility, reliability, and modern web standards.',
  focusTitle: 'Core competencies & technical stack.',
  focusIntro:
    'Engineering resilient frontend systems centered on browser standards, performant JavaScript, accessible interfaces, and scalable architectures.',
  careerTitle: 'Engineering dependable frontend solutions.',
  careerIntro:
    'Delivering thoughtful implementation, scalable architecture, and production-grade user experiences with strong technical ownership and collaborative execution.',
  availability: 'Open to frontend engineering roles, contract work, and technical collaboration.',
  facts: seedFacts,
  skills: seedSkills,
  strengths: seedStrengths
};

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ source: 'seed', data: DEFAULT_PROFILE });
    }
    const doc = await db.collection('profile').findOne({ key: 'main' });
    if (!doc) {
      return NextResponse.json({ source: 'seed', data: DEFAULT_PROFILE });
    }
    // Merge so new fields always have sane defaults
    return NextResponse.json({
      source: 'mongodb',
      data: { ...DEFAULT_PROFILE, ...doc.data, _updatedAt: doc.updatedAt || null }
    });
  } catch (_error) {
    return NextResponse.json({ source: 'seed_fallback', data: DEFAULT_PROFILE });
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
    const result = await db.collection('profile').updateOne(
      { key: 'main' },
      { $set: { key: 'main', data: body, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
