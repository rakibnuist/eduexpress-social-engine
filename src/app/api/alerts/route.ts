import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const alerts = db.prepare('SELECT * FROM competitor_alerts ORDER BY created_at DESC').all();
  return NextResponse.json({ alerts });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { competitor, alert_type, description, severity, source_url } = body;

  if (!competitor || !alert_type || !description) {
    return NextResponse.json({ error: 'competitor, alert_type, description are required' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO competitor_alerts (competitor, alert_type, description, severity, source_url) VALUES (?, ?, ?, ?, ?)'
  ).run(competitor, alert_type, description, severity || 'medium', source_url || '');

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { id, resolved } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  db.prepare('UPDATE competitor_alerts SET resolved = ? WHERE id = ?').run(resolved ? 1 : 0, Number(id));
  return NextResponse.json({ success: true });
}
