export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';

import { blogPosts as seedBlogs } from '../../../lib/data';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ source: 'seed', data: seedBlogs }, { headers: corsHeaders() });
    }

    const blogs = await db.collection('blogs').find({}).sort({ date: -1, createdAt: -1 }).toArray();
    if (!blogs || blogs.length === 0) {
      return NextResponse.json({ source: 'seed', data: seedBlogs }, { headers: corsHeaders() });
    }
    const formatted = blogs.map(b => ({
      ...b,
      id: b.id || b._id.toString()
    }));

    return NextResponse.json({ source: 'mongodb', data: formatted }, { headers: corsHeaders() });
  } catch (_error) {
    return NextResponse.json({ source: 'seed_fallback', data: seedBlogs }, { headers: corsHeaders() });
  }
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json();
    const { title, excerpt, content, tags, readTime } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400, headers: corsHeaders() });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'MongoDB Atlas is not connected. Please set MONGODB_URI.' }, { status: 503, headers: corsHeaders() });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newBlog = {
      id: slug || `blog-${Date.now()}`,
      title,
      date: new Date().toISOString().split('T')[0],
      readTime: readTime || '4 min read',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['General']),
      excerpt: excerpt || content.slice(0, 160) + '...',
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('blogs').insertOne(newBlog);
    return NextResponse.json({ success: true, data: { ...newBlog, _id: result.insertedId } }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500, headers: corsHeaders() });
  }
}
