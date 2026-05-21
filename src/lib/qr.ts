import QRCode from 'qrcode';

export async function generateQR(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 300,
    color: { dark: '#2b2418', light: '#fbf6e9' },
  });
}
