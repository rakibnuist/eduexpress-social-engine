import { NextRequest, NextResponse } from 'next/server';
import { getOffers, createOffer, updateOffer, deleteOffer } from '@/lib/db';

export async function GET() {
  try {
    const offers = getOffers();
    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch offers', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const offer = createOffer(body);
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create offer', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    updateOffer(Number(id), updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update offer', message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    deleteOffer(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete offer', message: (error as Error).message },
      { status: 500 }
    );
  }
}
