import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box } from 'leather-styles/jsx';

interface ToastContextValue {
  showToast(message: string): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2600;

// Minimal local toast for the multisig preview. apps/web has no shared toast
// mechanism (confirmed in U4); production extraction routes success feedback
// through whatever the app standardizes on.
export function MultisigToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <Box
          role="status"
          aria-live="polite"
          position="fixed"
          bottom="space.07"
          left="50%"
          transform="translateX(-50%)"
          zIndex={9999}
          px="space.04"
          py="space.03"
          borderRadius="md"
          bg="ink.action-primary-default"
          color="ink.background-primary"
          textStyle="label.02"
          boxShadow="0 8px 24px rgba(18,16,15,0.18)"
        >
          {message}
        </Box>
      )}
    </ToastContext.Provider>
  );
}

export function useMultisigToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useMultisigToast must be used within <MultisigToastProvider>');
  return ctx;
}
