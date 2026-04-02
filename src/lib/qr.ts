import QRCode from 'qrcode';

export async function generateQRCode(data: {
  bookingId: string;
  type: 'booking' | 'season_pass';
}): Promise<string> {
  const payload = JSON.stringify(data);
  return QRCode.toDataURL(payload, {
    width: 300,
    margin: 2,
    color: {
      dark: '#0A1628',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}
