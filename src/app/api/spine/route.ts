import { NextResponse } from 'next/server';

const SPINE_API_URL = process.env.SPINE_API_URL || 'https://spine.integratewise.online';

export async function GET() {
  try {
    const response = await fetch(`${SPINE_API_URL}/health`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to connect to spine:', error);
    return NextResponse.json({ error: 'Failed to connect to spine' }, { status: 500 });
  }
}
