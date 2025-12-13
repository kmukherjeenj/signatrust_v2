import { NextRequest, NextResponse } from 'next/server';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'missing_token' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${SIGNING_SERVICE_URL}/public/session-by-token?token=${encodeURIComponent(token)}`,
      {
        headers: {
          'User-Agent': request.headers.get('user-agent') || 'Next.js',
          'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
