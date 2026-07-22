import { useEffect, useRef, useState } from 'react';

interface UiClipboard {
  value: string;
  onCopy(): void;
  hasCopied: boolean;
}

function copyToClipboard(value: string) {
  if (!navigator.clipboard) return;
  void navigator.clipboard.writeText(value);
}

export function useClipboard(value: string): UiClipboard {
  const [hasCopied, setHasCopied] = useState(false);
  const timers = useRef<number[]>([]);

  function onCopy() {
    copyToClipboard(value);
    setHasCopied(true);
    timers.current.push(window.setTimeout(() => setHasCopied(false), 1250));
  }

  useEffect(() => () => timers.current.forEach(timer => clearTimeout(timer)), []);

  return { value, onCopy, hasCopied };
}
