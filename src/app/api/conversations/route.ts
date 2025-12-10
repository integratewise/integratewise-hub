import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const projectKey = searchParams.get('project');
    const limit = parseInt(searchParams.get('limit') || '50');

    let conversations;
    if (provider && projectKey) {
      conversations = await sql`
        SELECT id, ai_provider, title, summary, topic_key, project_key, section,
               created_at, updated_at, message_count
        FROM ai_conversations
        WHERE ai_provider = ${provider} AND project_key = ${projectKey}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (provider) {
      conversations = await sql`
        SELECT id, ai_provider, title, summary, topic_key, project_key, section,
               created_at, updated_at, message_count
        FROM ai_conversations
        WHERE ai_provider = ${provider}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (projectKey) {
      conversations = await sql`
        SELECT id, ai_provider, title, summary, topic_key, project_key, section,
               created_at, updated_at, message_count
        FROM ai_conversations
        WHERE project_key = ${projectKey}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      conversations = await sql`
        SELECT id, ai_provider, title, summary, topic_key, project_key, section,
               created_at, updated_at, message_count
        FROM ai_conversations
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
