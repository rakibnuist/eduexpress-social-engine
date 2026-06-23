import { NextRequest, NextResponse } from 'next/server';
import { updateContentPackage } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contentPackage = updateContentPackage(Number(id), body);
    return NextResponse.json({ success: true, package: contentPackage });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update content package', message: (error as Error).message },
      { status: 500 }
    );
  }
}