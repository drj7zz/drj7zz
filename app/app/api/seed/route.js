export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';
import blogSeed from '../../../seed_data/blogs.json';
import projectSeed from '../../../seed_data/projects.json';
import siteInfoSeed from '../../../seed_data/site_info.json';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({
        error: 'MongoDB Atlas is not configured. Add MONGODB_URI to your environment variables.'
      }, { status: 503 });
    }

    // 1. Sync Blogs
    await db.collection('blogs').deleteMany({});
    const formattedBlogs = blogSeed.map(b => ({
      ...b,
      createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : new Date()
    }));
    if (formattedBlogs.length > 0) {
      await db.collection('blogs').insertMany(formattedBlogs);
    }

    // 2. Sync Projects
    await db.collection('projects').deleteMany({});
    const formattedProjects = projectSeed.map((p, idx) => ({
      ...p,
      order: p.order || (idx + 1),
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
    }));
    if (formattedProjects.length > 0) {
      await db.collection('projects').insertMany(formattedProjects);
    }

    // 3. Sync Site Info
    const infoPayload = Array.isArray(siteInfoSeed) ? siteInfoSeed[0]?.data : (siteInfoSeed.data || siteInfoSeed);
    await db.collection('site_info').updateOne(
      { key: 'main' },
      {
        $set: {
          key: 'main',
          data: infoPayload,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas successfully seeded and synchronized with portfolio data!',
      synced: {
        blogs: formattedBlogs.length,
        projects: formattedProjects.length,
        siteInfo: true
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Seed synchronization failed' }, { status: 500 });
  }
}
