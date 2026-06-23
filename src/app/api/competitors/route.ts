import { NextRequest, NextResponse } from 'next/server';
import { getCompetitors, createCompetitor, updateCompetitor } from '@/lib/db';

export async function GET() {
  try {
    const competitors = getCompetitors();
    return NextResponse.json({ competitors });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch competitors', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const competitor = createCompetitor(body);
    return NextResponse.json({ success: true, competitor });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create competitor', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required for updates' },
        { status: 400 }
      );
    }

    const competitor = updateCompetitor(Number(id), updates);
    return NextResponse.json({ success: true, competitor });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update competitor', message: (error as Error).message },
      { status: 500 }
    );
  }
}