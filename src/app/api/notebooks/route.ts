import { NextRequest, NextResponse } from 'next/server';
import { getNotebooks, createNotebook, getStats } from '@/lib/db';

export async function GET() {
  try {
    const [notebooks, stats] = await Promise.all([
      getNotebooks(),
      getStats()
    ]);

    return NextResponse.json({ notebooks, stats });
  } catch (error) {
    console.error('Failed to fetch notebooks:', error);
    return NextResponse.json({ error: 'Failed to fetch notebooks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const notebook = await createNotebook(body);
    return NextResponse.json(notebook, { status: 201 });
  } catch (error) {
    console.error('Failed to create notebook:', error);
    return NextResponse.json({ error: 'Failed to create notebook' }, { status: 500 });
  }
}
