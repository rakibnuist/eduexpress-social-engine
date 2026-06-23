import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const calendar = db.prepare('SELECT * FROM content_calendar ORDER BY date, id').all();
  return NextResponse.json({ calendar });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { date, platform, content_type, caption, status, assigned_to, notes } = body;

  if (!date || !platform || !content_type || !caption) {
    return NextResponse.json({ error: 'date, platform, content_type, caption are required' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO content_calendar (date, platform, content_type, caption, status, assigned_to, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(date, platform, content_type, caption, status || 'draft', assigned_to || '', notes || '');

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { id, status, assigned_to, notes, caption } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (status !== undefined) { updates.push('status = ?'); values.push(status); }
  if (assigned_to !== undefined) { updates.push('assigned_to = ?'); values.push(assigned_to); }
  if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
  if (caption !== undefined) { updates.push('caption = ?'); values.push(caption); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(Number(id));

  db.prepare(`UPDATE content_calendar SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  db.prepare('DELETE FROM content_calendar WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}
