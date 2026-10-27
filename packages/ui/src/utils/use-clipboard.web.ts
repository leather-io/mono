import { useEffect, useRef, useState } from 'react';

interface UiClipboard {
  value: string;
  onCopy(): Promise<boolean>;
  hasCopied: boolean;
  hasCopyFailed: boolean;
}

const copiedFeedbackDuration = 1250;

export function useClipboard(value: string): UiClipboard {
  const [hasCopied, setHasCopied] = useState(false);
  const [hasCopyFailed, setHasCopyFailed] = useState(false);
  const mounted = useRef(false);
  const request = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  function clearTimer() {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  }

  async function onCopy() {
    const activeRequest = ++request.current;
    clearTimer();
    setHasCopied(false);
    setHasCopyFailed(false);

    try {
      if (!navigator.clipboard) {
        setHasCopyFailed(true);
        return false;
      }
      await navigator.clipboard.writeText(value);
      if (!mounted.current || request.current !== activeRequest) return false;
      setHasCopied(true);
      timer.current = window.setTimeout(() => {
        if (mounted.current && request.current === activeRequest) setHasCopied(false);
      }, copiedFeedbackDuration);
      return true;
    } catch {
      if (mounted.current && request.current === activeRequest) setHasCopyFailed(true);
      return false;
    }
  }

  useEffect(() => {
    mounted.current = true;
    setHasCopied(false);
    setHasCopyFailed(false);
    return () => {
      mounted.current = false;
      request.current += 1;
      clearTimer();
    };
  }, [value]);

  return { value, onCopy, hasCopied, hasCopyFailed };
}
