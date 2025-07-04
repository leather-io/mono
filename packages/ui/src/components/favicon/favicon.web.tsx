import { useState } from 'react';

interface FaviconProps {
  origin: string;
  size?: 16 | 32 | 64;
}

export function Favicon({ origin, size = 16 }: FaviconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${origin}&sz=${size * getPixelRatio()}`}
      width={size}
      height={size}
      alt={`Favicon of ${origin}`}
      onError={() => setHasError(true)}
    />
  );
}

function getPixelRatio(): number {
  if (typeof window === 'undefined' || !window.devicePixelRatio) {
    return 2;
  }

  return window.devicePixelRatio;
}
