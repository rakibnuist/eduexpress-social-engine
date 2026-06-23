import { NextRequest, NextResponse } from 'next/server';
import { getDb, createContentPackage } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendar_id');

    const db = getDb();
    let packages;
    if (calendarId) {
      packages = db
        .prepare(
          'SELECT * FROM content_packages WHERE calendar_id = ? ORDER BY id DESC'
        )
        .all(Number(calendarId));
    } else {
      packages = db
        .prepare('SELECT * FROM content_packages ORDER BY id DESC')
        .all();
    }

    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch content packages', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contentPackage = createContentPackage(body);
    return NextResponse.json({ success: true, package: contentPackage });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create content package', message: (error as Error).message },
      { status: 500 }
    );
  }
}