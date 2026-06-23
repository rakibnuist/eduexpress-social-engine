import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsWeekly, createAnalyticsWeekly } from '@/lib/db';

export async function GET() {
  try {
    const reports = getAnalyticsWeekly();
    return NextResponse.json({ analytics: reports });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch weekly analytics', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.week_start || !body.week_end) {
      return NextResponse.json(
        { error: 'week_start and week_end are required' },
        { status: 400 }
      );
    }

    const report = createAnalyticsWeekly(body);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create weekly report', message: (error as Error).message },
      { status: 500 }
    );
  }
}