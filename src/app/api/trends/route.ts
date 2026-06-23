import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const trends = db.prepare('SELECT * FROM trends ORDER BY priority DESC, created_at DESC').all();
  return NextResponse.json({ trends });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { title, description, opportunity, priority, status } = body;

  if (!title || !description) {
    return NextResponse.json({ error: 'title, description are required' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO trends (title, description, opportunity, priority, status) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, opportunity || '', priority || 'medium', status || 'new');

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { id, status, priority, opportunity } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (status !== undefined) { updates.push('status = ?'); values.push(status); }
  if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
  if (opportunity !== undefined) { updates.push('opportunity = ?'); values.push(opportunity); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(Number(id));

  db.prepare(`UPDATE trends SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  return NextResponse.json({ success: true });
}
