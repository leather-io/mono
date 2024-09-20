import { useState } from 'react';

interface FaviconProps {
  origin: string;
  size?: 16 | 32;
}
export function Favicon({ origin, size = 16 }: FaviconProps) {
  const [hasError, setHasError] = useState(false);
  if (hasError) return null;
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${origin}&sz=${size * 2}`}
      width={size}
      height={size}
      alt={`Favicon of ${origin}`}
      onError={() => setHasError(true)}
    />
  );
}
