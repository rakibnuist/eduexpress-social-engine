import { NextRequest, NextResponse } from 'next/server';
import { getDb, setSetting } from '@/lib/db';

export async function GET() {
  try {
    const rows = getDb()
      .prepare('SELECT key, value FROM engine_settings ORDER BY key')
      .all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch engine settings', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body === 'object' && body !== null) {
      const updates: Record<string, string> = body;
      for (const [key, value] of Object.entries(updates)) {
        setSetting(key, String(value));
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Expected an object of key/value pairs to update' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update engine settings', message: (error as Error).message },
      { status: 500 }
    );
  }
}