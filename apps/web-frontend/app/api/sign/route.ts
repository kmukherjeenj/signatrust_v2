import { NextRequest, NextResponse } from 'next/server';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${SIGNING_SERVICE_URL}/public/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Next.js',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting signature:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
