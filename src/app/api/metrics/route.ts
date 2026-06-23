import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let metrics;
  if (category) {
    metrics = db.prepare('SELECT * FROM metrics WHERE category = ? ORDER BY id').all(category);
  } else {
    metrics = db.prepare('SELECT * FROM metrics ORDER BY category, id').all();
  }

  return NextResponse.json({ metrics });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { category, name, value, delta, icon } = body;

  if (!category || !name || !value) {
    return NextResponse.json({ error: 'category, name, value are required' }, { status: 400 });
  }

  // Upsert: update if exists, insert if not
  const existing = db.prepare('SELECT id FROM metrics WHERE category = ? AND name = ?').get(category, name) as { id: number } | undefined;

  if (existing) {
    db.prepare('UPDATE metrics SET value = ?, delta = ?, icon = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(value, delta || '', icon || '', existing.id);
    return NextResponse.json({ success: true, action: 'updated', id: existing.id });
  } else {
    const result = db.prepare('INSERT INTO metrics (category, name, value, delta, icon) VALUES (?, ?, ?, ?, ?)')
      .run(category, name, value, delta || '', icon || '');
    return NextResponse.json({ success: true, action: 'created', id: result.lastInsertRowid });
  }
}

export async function DELETE(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  db.prepare('DELETE FROM metrics WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}
