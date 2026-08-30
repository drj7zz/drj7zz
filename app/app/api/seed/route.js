export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';
import { blogPosts, projects, socialLinks, facts, heroSignals } from '../../../lib/data';

export async function POST() {
  try {
    const session = getAdminSession();
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
    const formattedBlogs = blogPosts.map(b => ({
      ...b,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await db.collection('blogs').insertMany(formattedBlogs);

    // 2. Sync Projects
    await db.collection('projects').deleteMany({});
    const formattedProjects = projects.map((p, idx) => ({
      ...p,
      order: idx + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    await db.collection('projects').insertMany(formattedProjects);

    // 3. Sync Site Info
    await db.collection('site_info').updateOne(
      { key: 'main' },
      {
        $set: {
          key: 'main',
          data: {
            socialLinks,
            facts,
            heroSignals
          },
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
