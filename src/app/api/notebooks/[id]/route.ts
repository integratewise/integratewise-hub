import { NextRequest, NextResponse } from 'next/server';
import { getNotebook, updateNotebook, deleteNotebook, getDocuments } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [notebook, documents] = await Promise.all([
      getNotebook(id),
      getDocuments(id)
    ]);

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json({ notebook, documents });
  } catch (error) {
    console.error('Failed to fetch notebook:', error);
    return NextResponse.json({ error: 'Failed to fetch notebook' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const notebook = await updateNotebook(id, body);

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Failed to update notebook:', error);
    return NextResponse.json({ error: 'Failed to update notebook' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteNotebook(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notebook:', error);
    return NextResponse.json({ error: 'Failed to delete notebook' }, { status: 500 });
  }
}
