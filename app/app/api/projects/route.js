export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/mongodb';
import { getAdminSession } from '../../../lib/auth';

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
      return NextResponse.json({ source: 'mongodb_unconnected', data: [] }, { headers: corsHeaders() });
    }

    const projects = await db.collection('projects').find({}).sort({ order: 1, createdAt: -1 }).toArray();
    const formatted = projects.map(p => ({
      ...p,
      id: p.id || p._id.toString()
    }));

    return NextResponse.json({ source: 'mongodb', data: formatted }, { headers: corsHeaders() });
  } catch (_error) {
    return NextResponse.json({ source: 'error', data: [] }, { headers: corsHeaders() });
  }
}

export async function POST(request) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
    }

    const body = await request.json();
    const { name, description, stack, code, live, order } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400, headers: corsHeaders() });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'MongoDB Atlas is not connected. Please set MONGODB_URI.' }, { status: 503, headers: corsHeaders() });
    }

    const newProject = {
      name,
      description,
      stack: stack || 'JavaScript',
      code: code || '',
      live: live || '',
      order: order ? Number(order) : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('projects').insertOne(newProject);
    return NextResponse.json({ success: true, data: { ...newProject, _id: result.insertedId } }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500, headers: corsHeaders() });
  }
}
