/**
 * Certificate Generator Service
 *
 * Generates a PDF certificate as proof of signing for completed sessions.
 * The certificate includes document info, all signatures, timestamps, and blockchain records.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { prisma } from '../adapters/prisma.js';

interface CertificateData {
  sessionId: string;
  documentName: string;
  documentHash: string;
  createdAt: Date;
  completedAt: Date | null;
  chainRecord: string | null;
  signers: Array<{
    email: string | null;
    phone: string | null;
    signedAt: Date | null;
    signatureImage: string | null;
    signatureHash: string | null;
  }>;
}

/**
 * Fetch all data needed for certificate generation
 */
export async function getCertificateData(sessionId: string): Promise<CertificateData | null> {
  const session = await prisma.signingSession.findUnique({
    where: { id: sessionId },
    include: {
      document: true,
      signers: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!session) return null;

  // Find completion time (last signer's signedAt)
  const completedAt = session.signers
    .filter(s => s.signedAt)
    .map(s => s.signedAt!)
    .sort((a, b) => b.getTime() - a.getTime())[0] || null;

  return {
    sessionId: session.id,
    documentName: session.document.name,
    documentHash: session.document.hashSha256,
    createdAt: session.createdAt,
    completedAt,
    chainRecord: session.chainRecord,
    signers: session.signers.map(s => ({
      email: s.email,
      phone: s.phone,
      signedAt: s.signedAt,
      signatureImage: s.signatureImage,
      signatureHash: s.signatureHash,
    })),
  };
}

/**
 * Generate a signing certificate PDF
 */
export async function generateCertificate(sessionId: string): Promise<Uint8Array | null> {
  const data = await getCertificateData(sessionId);
  if (!data) return null;

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();

  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Colors
  const emerald = rgb(0.06, 0.78, 0.56); // #10c78f
  const darkGray = rgb(0.15, 0.15, 0.15);
  const mediumGray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.6, 0.6, 0.6);

  let y = height - 50;

  // Header
  page.drawRectangle({
    x: 0,
    y: height - 80,
    width: width,
    height: 80,
    color: rgb(0.05, 0.05, 0.08),
  });

  page.drawText('SignaTrust', {
    x: 50,
    y: height - 50,
    size: 24,
    font: helveticaBold,
    color: emerald,
  });

  page.drawText('Certificate of Signing', {
    x: 50,
    y: height - 70,
    size: 12,
    font: helvetica,
    color: lightGray,
  });

  // Verification badge
  page.drawText('BLOCKCHAIN VERIFIED', {
    x: width - 170,
    y: height - 55,
    size: 10,
    font: helveticaBold,
    color: emerald,
  });

  y = height - 120;

  // Document Information Section
  page.drawText('DOCUMENT INFORMATION', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: mediumGray,
  });

  y -= 25;

  page.drawText('Document Name:', {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: mediumGray,
  });
  page.drawText(data.documentName, {
    x: 150,
    y,
    size: 10,
    font: helveticaBold,
    color: darkGray,
  });

  y -= 18;

  page.drawText('Document Hash:', {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: mediumGray,
  });
  page.drawText('SHA-256', {
    x: 150,
    y,
    size: 8,
    font: helvetica,
    color: lightGray,
  });

  y -= 14;

  // Hash in monospace (split into two lines if needed)
  const hash1 = data.documentHash.substring(0, 32);
  const hash2 = data.documentHash.substring(32);
  page.drawText(hash1, {
    x: 50,
    y,
    size: 8,
    font: courier,
    color: darkGray,
  });
  y -= 12;
  page.drawText(hash2, {
    x: 50,
    y,
    size: 8,
    font: courier,
    color: darkGray,
  });

  y -= 25;

  page.drawText('Session ID:', {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: mediumGray,
  });
  page.drawText(data.sessionId, {
    x: 150,
    y,
    size: 9,
    font: courier,
    color: darkGray,
  });

  y -= 18;

  page.drawText('Created:', {
    x: 50,
    y,
    size: 10,
    font: helvetica,
    color: mediumGray,
  });
  page.drawText(data.createdAt.toISOString(), {
    x: 150,
    y,
    size: 10,
    font: helvetica,
    color: darkGray,
  });

  if (data.completedAt) {
    y -= 18;
    page.drawText('Completed:', {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: mediumGray,
    });
    page.drawText(data.completedAt.toISOString(), {
      x: 150,
      y,
      size: 10,
      font: helvetica,
      color: darkGray,
    });
  }

  // Divider
  y -= 30;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  y -= 25;

  // Blockchain Record Section
  if (data.chainRecord) {
    page.drawText('BLOCKCHAIN RECORD', {
      x: 50,
      y,
      size: 10,
      font: helveticaBold,
      color: mediumGray,
    });

    y -= 20;

    page.drawText('Network:', {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: mediumGray,
    });
    page.drawText('Solana (Devnet)', {
      x: 150,
      y,
      size: 10,
      font: helvetica,
      color: darkGray,
    });

    y -= 18;

    page.drawText('Account:', {
      x: 50,
      y,
      size: 10,
      font: helvetica,
      color: mediumGray,
    });
    page.drawText(data.chainRecord, {
      x: 150,
      y,
      size: 8,
      font: courier,
      color: darkGray,
    });

    // Generate QR code for blockchain explorer
    const explorerUrl = `https://explorer.solana.com/address/${data.chainRecord}?cluster=devnet`;
    try {
      const qrDataUrl = await QRCode.toDataURL(explorerUrl, { width: 80, margin: 1 });
      const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      page.drawImage(qrImage, {
        x: width - 130,
        y: y - 50,
        width: 70,
        height: 70,
      });
      page.drawText('Scan to verify', {
        x: width - 130,
        y: y - 62,
        size: 7,
        font: helvetica,
        color: lightGray,
      });
    } catch (e) {
      // QR code generation failed, skip it
    }

    y -= 30;

    // Divider
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });

    y -= 25;
  }

  // Signers Section
  page.drawText('SIGNATURES', {
    x: 50,
    y,
    size: 10,
    font: helveticaBold,
    color: mediumGray,
  });

  y -= 10;

  for (let i = 0; i < data.signers.length; i++) {
    const signer = data.signers[i];
    y -= 20;

    // Check if we need a new page
    if (y < 150) {
      const newPage = pdfDoc.addPage([612, 792]);
      y = height - 50;
    }

    // Signer box
    page.drawRectangle({
      x: 50,
      y: y - 70,
      width: width - 100,
      height: 80,
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Signer number
    page.drawText(`Signer ${i + 1}`, {
      x: 60,
      y: y - 5,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });

    // Contact info
    const contact = signer.email || signer.phone || 'Unknown';
    page.drawText(contact, {
      x: 60,
      y: y - 20,
      size: 9,
      font: helvetica,
      color: mediumGray,
    });

    // Signed timestamp
    if (signer.signedAt) {
      page.drawText(`Signed: ${signer.signedAt.toISOString()}`, {
        x: 60,
        y: y - 35,
        size: 8,
        font: helvetica,
        color: lightGray,
      });
    }

    // Signature hash
    if (signer.signatureHash) {
      page.drawText(`Hash: ${signer.signatureHash.substring(0, 32)}...`, {
        x: 60,
        y: y - 50,
        size: 7,
        font: courier,
        color: lightGray,
      });
    }

    // Embed signature image if available
    if (signer.signatureImage) {
      try {
        const imageData = signer.signatureImage.split(',')[1];
        const imageBytes = Buffer.from(imageData, 'base64');
        const signatureImg = await pdfDoc.embedPng(imageBytes);

        // Scale to fit in box
        const maxWidth = 150;
        const maxHeight = 50;
        const scale = Math.min(maxWidth / signatureImg.width, maxHeight / signatureImg.height);

        page.drawImage(signatureImg, {
          x: width - 200,
          y: y - 60,
          width: signatureImg.width * scale,
          height: signatureImg.height * scale,
        });
      } catch (e) {
        // Failed to embed signature image
        page.drawText('[Signature on file]', {
          x: width - 180,
          y: y - 40,
          size: 9,
          font: helvetica,
          color: lightGray,
        });
      }
    }

    // Status badge
    const status = signer.signedAt ? 'SIGNED' : 'PENDING';
    const statusColor = signer.signedAt ? emerald : rgb(0.8, 0.6, 0.2);
    page.drawText(status, {
      x: width - 100,
      y: y - 5,
      size: 8,
      font: helveticaBold,
      color: statusColor,
    });

    y -= 90;
  }

  // Footer
  const footerY = 40;
  page.drawLine({
    start: { x: 50, y: footerY + 20 },
    end: { x: width - 50, y: footerY + 20 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText('This certificate was generated by SignaTrust - Blockchain Document Signing', {
    x: 50,
    y: footerY,
    size: 8,
    font: helvetica,
    color: lightGray,
  });

  page.drawText(`Generated: ${new Date().toISOString()}`, {
    x: width - 200,
    y: footerY,
    size: 8,
    font: helvetica,
    color: lightGray,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
