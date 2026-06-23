import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('package_id');
    const db = getDb();
    let assets;
    if (packageId) {
      assets = db.prepare('SELECT * FROM design_assets WHERE content_package_id=? ORDER BY id DESC').all(Number(packageId));
    } else {
      assets = db.prepare('SELECT * FROM design_assets ORDER BY id DESC').all();
    }
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch design assets', message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    const result = db.prepare(`INSERT INTO design_assets (content_package_id, asset_type, file_url, drive_file_id, dimensions, format, status, assigned_to, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      body.content_package_id ?? null, body.asset_type ?? '', body.file_url ?? '', body.drive_file_id ?? '', body.dimensions ?? '', body.format ?? '', body.status ?? 'pending', body.assigned_to ?? '', body.feedback ?? ''
    );
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create design asset', message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const db = getDb();
    const fields = ['content_package_id', 'asset_type', 'file_url', 'drive_file_id', 'dimensions', 'format', 'status', 'assigned_to', 'feedback'];
    const setClause = fields.filter(f => updates[f] !== undefined).map(f => `${f}=?`).join(', ');
    const values = fields.filter(f => updates[f] !== undefined).map(f => updates[f]);
    if (setClause) {
      values.push(id);
      db.prepare(`UPDATE design_assets SET ${setClause}, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(...values);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update design asset', message: (error as Error).message }, { status: 500 });
  }
}
