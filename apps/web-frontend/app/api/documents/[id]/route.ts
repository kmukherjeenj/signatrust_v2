import { NextRequest, NextResponse } from 'next/server';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params;

  try {
    const response = await fetch(
      `${SIGNING_SERVICE_URL}/public/documents/${documentId}`,
      {
        headers: {
          'User-Agent': request.headers.get('user-agent') || 'Next.js',
        },
      }
    );

    if (!response.ok) {
      // Handle redirect
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          return NextResponse.redirect(location);
        }
      }

      const data = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(data, { status: response.status });
    }

    // Stream the response body
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
    };

    if (contentDisposition) {
      headers['Content-Disposition'] = contentDisposition;
    }

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
