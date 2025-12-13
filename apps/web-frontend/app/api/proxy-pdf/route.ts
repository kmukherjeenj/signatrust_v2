import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy external PDFs to avoid CORS issues
 * Usage: /api/proxy-pdf?url=https://example.com/doc.pdf
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Only allow PDF URLs for security
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SignaTrust-PDF-Proxy/1.0',
      },
      redirect: 'follow', // Follow redirects
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch PDF' },
      { status: 500 }
    );
  }
}
