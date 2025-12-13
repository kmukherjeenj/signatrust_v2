import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;

    const response = await fetch(
      `${SIGNING_SERVICE_URL}/sessions/${sessionId}/audit-log`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': session.user.id,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
