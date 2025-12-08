import { NextRequest, NextResponse } from 'next/server';
import { createDocument } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.notebook_id || !body.title) {
      return NextResponse.json({ error: 'notebook_id and title are required' }, { status: 400 });
    }

    const document = await createDocument(body);
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
