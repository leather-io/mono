import { useCallback, useEffect, useRef, useState } from 'react';

const copiedResetMs = 1400;

export function useClipboardCopy() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback((value: string) => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(value);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), copiedResetMs);
  }, []);

  return { copied, copy };
}
