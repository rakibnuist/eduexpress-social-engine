import { NextRequest, NextResponse } from 'next/server';
import { updateOffer, deleteOffer } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const offer = updateOffer(Number(id), body);
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update offer', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteOffer(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete offer', message: (error as Error).message },
      { status: 500 }
    );
  }
}