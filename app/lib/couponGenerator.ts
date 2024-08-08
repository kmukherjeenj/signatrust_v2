
import QRCode from 'qrcode';

interface KeypairCoupon {
  did: string;
  publicKey: string;
  encryptedPrivateKey: string;
}

export async function generateAppleCoupon(keypair: KeypairCoupon): Promise<string> {
  const couponData = JSON.stringify(keypair);
  const qrCodeDataUrl = await QRCode.toDataURL(couponData);

  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto;">
          <h2 style="text-align: center;">Your Signatrust DID Coupon</h2>
          <p>DID: ${keypair.did}</p>
          <p>Scan this QR code with your Apple Wallet:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" style="display: block; margin: 0 auto; max-width: 200px;">
          <p style="font-size: 12px; text-align: center;">This coupon contains your secure DID information.</p>
        </div>
      </body>
    </html>
  `;
}

export async function generateAndroidCoupon(keypair: KeypairCoupon): Promise<string> {
  const couponData = JSON.stringify(keypair);
  const qrCodeDataUrl = await QRCode.toDataURL(couponData);

  return `
    <html>
      <body style="font-family: Roboto, sans-serif;">
        <div style="border: 2px solid #4285F4; padding: 20px; max-width: 400px; margin: 0 auto; border-radius: 8px;">
          <h2 style="text-align: center; color: #4285F4;">Your Signatrust DID Pass</h2>
          <p>DID: ${keypair.did}</p>
          <p>Scan this QR code with Google Pay:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" style="display: block; margin: 0 auto; max-width: 200px;">
          <p style="font-size: 12px; text-align: center; color: #666;">This pass contains your secure DID information.</p>
        </div>
      </body>
    </html>
  `;
}