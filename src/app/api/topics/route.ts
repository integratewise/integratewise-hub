import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const projectKey = searchParams.get('project');
    const limit = parseInt(searchParams.get('limit') || '50');

    let topics;
    if (projectKey) {
      topics = await sql`
        SELECT * FROM topics
        WHERE project_key = ${projectKey} AND status = 'active'
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;
    } else {
      topics = await sql`
        SELECT * FROM topics
        WHERE status = 'active'
        ORDER BY updated_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}
