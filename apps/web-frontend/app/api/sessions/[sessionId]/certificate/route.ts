import { NextRequest, NextResponse } from 'next/server';

const SIGNING_SERVICE_URL = process.env.SIGNING_SERVICE_URL || 'http://localhost:4030';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;

    const response = await fetch(
      `${SIGNING_SERVICE_URL}/sessions/${sessionId}/certificate`,
      {
        headers: {
          'Accept': 'application/pdf',
        },
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(data, { status: response.status });
    }

    // Stream the PDF response
    const pdfBuffer = await response.arrayBuffer();

    const contentDisposition = response.headers.get('content-disposition') ||
      `attachment; filename="SignaTrust_Certificate.pdf"`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
  }
}
