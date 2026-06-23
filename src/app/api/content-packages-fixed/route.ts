import { NextRequest, NextResponse } from 'next/server';
import { getDb, getContentPackages } from '@/lib/db';

export async function GET() {
  try {
    const packages = getContentPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content packages', message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    const result = db.prepare(`INSERT INTO content_packages (calendar_id, caption_bangla, caption_english, caption_mixed, hashtags, post_time, platform, content_type, copy_approved, design_approved, video_approved, ready_to_post, posted, posted_at, post_url, engagement_likes, engagement_comments, engagement_shares, performance_score, poster_guidelines, video_script, video_guidelines, cta, drive_folder_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      body.calendar_id ?? null, body.caption_bangla ?? '', body.caption_english ?? '', body.caption_mixed ?? '',
      body.hashtags ?? '', body.post_time ?? '', body.platform ?? '', body.content_type ?? '',
      body.copy_approved ?? 0, body.design_approved ?? 0, body.video_approved ?? 0,
      body.ready_to_post ?? 0, body.posted ?? 0, body.posted_at ?? '', body.post_url ?? '',
      body.engagement_likes ?? '', body.engagement_comments ?? '', body.engagement_shares ?? '',
      body.performance_score ?? '', body.poster_guidelines ?? '', body.video_script ?? '',
      body.video_guidelines ?? '', body.cta ?? '', body.drive_folder_url ?? ''
    );
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create content package', message: (error as Error).message }, { status: 500 });
  }
}
