import { useCallback, useState } from 'react';

import * as Clipboard from 'expo-clipboard';

const defaultSuccessStateDuration = 2000;

export type UseCopyToClipboardStatus = 'idle' | 'success' | 'error';

interface UseCopyToClipboardOptions {
  successStateDuration?: number;
}

export function useCopyToClipboard(value: string, options: UseCopyToClipboardOptions = {}) {
  const { successStateDuration = defaultSuccessStateDuration } = options;
  const [status, setStatus] = useState<UseCopyToClipboardStatus>('idle');

  const onCopy = useCallback(async () => {
    if (value.trim() === '') return;

    try {
      await Clipboard.setStringAsync(value);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), successStateDuration);
    }
  }, [value, successStateDuration]);

  return {
    onCopy,
    status,
  };
}
