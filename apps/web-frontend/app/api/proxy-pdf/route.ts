import { NextRequest, NextResponse } from 'next/server';

/**
 * Allowed hosts for PDF proxy (SSRF protection)
 */
const ALLOWED_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'www.dropbox.com',
  'dropbox.com',
  'dl.dropboxusercontent.com',
  'onedrive.live.com',
  '1drv.ms',
  'mozilla.github.io', // For demo PDFs
  'www.w3.org',
];

/**
 * Blocked IP patterns (internal networks)
 */
const BLOCKED_IP_PATTERNS = [
  /^10\./,                        // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,                  // 192.168.0.0/16
  /^169\.254\./,                  // Link-local
  /^127\./,                       // Loopback
  /^0\./,                         // Current network
  /^::1$/,                        // IPv6 loopback
  /^fc00:/i,                      // IPv6 private
  /^fe80:/i,                      // IPv6 link-local
];

/**
 * Proxy external PDFs to avoid CORS issues
 * Usage: /api/proxy-pdf?url=https://example.com/doc.pdf
 *
 * Security: Only allows whitelisted hosts and blocks internal IPs
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS (except for localhost in development)
    if (parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
    }

    // Check against blocked IP patterns
    const hostname = parsedUrl.hostname.toLowerCase();
    if (BLOCKED_IP_PATTERNS.some(pattern => pattern.test(hostname))) {
      console.warn(`[PDF Proxy] Blocked internal IP: ${hostname}`);
      return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    // Block localhost variants
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      console.warn(`[PDF Proxy] Blocked localhost: ${hostname}`);
      return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    // Check against allowed hosts
    if (!ALLOWED_HOSTS.some(allowed => hostname === allowed || hostname.endsWith('.' + allowed))) {
      console.warn(`[PDF Proxy] Blocked non-whitelisted host: ${hostname}`);
      return NextResponse.json(
        { error: 'Host not in allowlist. Contact support to add trusted hosts.' },
        { status: 403 }
      );
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SignaTrust-PDF-Proxy/1.0',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';

    // Verify it's actually a PDF or allowed document type
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
      return NextResponse.json({ error: 'Response is not a PDF' }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();

    // Limit response size (50MB max)
    if (buffer.byteLength > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF too large (max 50MB)' }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('PDF proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PDF' },
      { status: 500 }
    );
  }
}
