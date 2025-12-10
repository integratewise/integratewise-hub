import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const projectKey = searchParams.get('project');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    // Text-based search across topics and conversations
    const searchPattern = `%${query}%`;

    // Search topics
    const topics = await sql`
      SELECT id, title, topic_key, project_key, section, description, 'topic' as result_type
      FROM topics
      WHERE
        (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR topic_key ILIKE ${searchPattern})
        AND status = 'active'
        ${projectKey ? sql`AND project_key = ${projectKey}` : sql``}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;

    // Search conversations
    const conversations = await sql`
      SELECT id, title, topic_key, project_key, section, summary as description, 'conversation' as result_type
      FROM ai_conversations
      WHERE
        (title ILIKE ${searchPattern} OR summary ILIKE ${searchPattern})
        ${projectKey ? sql`AND project_key = ${projectKey}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    // Search notebooks
    const notebooks = await sql`
      SELECT id, name as title, category as project_key, description, 'notebook' as result_type
      FROM notebooks
      WHERE name ILIKE ${searchPattern} OR description ILIKE ${searchPattern}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({
      results: [...topics, ...conversations, ...notebooks],
      query,
      total: topics.length + conversations.length + notebooks.length
    });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
