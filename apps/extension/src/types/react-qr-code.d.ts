import type { CSSProperties, ComponentType } from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  viewBox?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

declare const QRCode: ComponentType<QrCodeProps>;
export default QRCode;
