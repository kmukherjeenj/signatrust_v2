import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get authenticated user session
    const session = await auth();
    const userId = session?.user?.id;

    // Pass userId to backend if authenticated
    const payload = {
      ...body,
      userId: userId || undefined, // Optional: only set if authenticated
    };

    const response = await fetch(`${SIGNING_SERVICE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
