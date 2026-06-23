import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const logs = db.prepare('SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT 100').all();
  return NextResponse.json({ logs });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const { agent_name, action, details, status } = body;

  if (!agent_name || !action) {
    return NextResponse.json({ error: 'agent_name, action are required' }, { status: 400 });
  }

  const result = db.prepare(
    'INSERT INTO agent_logs (agent_name, action, details, status) VALUES (?, ?, ?, ?)'
  ).run(agent_name, action, details || '', status || 'success');

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}
