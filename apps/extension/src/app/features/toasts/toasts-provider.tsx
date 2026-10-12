import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Toast, ToastLayout, animateToastEnter, animateToastExit } from '@leather.io/ui';

import type { HasChildren } from '@app/common/has-children';

import { ToastContext, toastDurations } from './use-toast';
import { type ExtensionToast, useToastHandlers } from './use-toast-handlers';

interface ToastItemProps {
  toast: ExtensionToast;
  onClose(this: void): void;
}
function ToastItem({ toast, onClose }: ToastItemProps) {
  const rootRef = useRef<HTMLLIElement>(null);
  const isClosingRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const hasCountdown = toast.variant === 'success';
  const rootStyle: CSSProperties = hasCountdown
    ? { animation: 'none', pointerEvents: 'auto' }
    : { animation: 'none' };

  useLayoutEffect(() => animateToastEnter(rootRef.current), []);

  function close() {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsClosing(true);
    void animateToastExit(rootRef.current).then(onClose);
  }

  return (
    <Toast.Root
      ref={rootRef}
      asChild
      forceMount
      open={!isClosing}
      duration={hasCountdown ? Infinity : toast.duration}
      style={rootStyle}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      onOpenChange={open => {
        if (!open) close();
      }}
    >
      <Toast.Title>
        <ToastLayout
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration ?? toastDurations.quick}
          isPaused={isPaused}
          isClosing={isClosing}
          onCountdownEnd={close}
        />
      </Toast.Title>
    </Toast.Root>
  );
}

function ToastsProvider(props: HasChildren) {
  const { children } = props;

  const {
    toasts,
    handleRemoveToast,
    handleDispatchError,
    handleDispatchInfo,
    handleDispatchSuccess,
    handleDispatchPromise,
  } = useToastHandlers();

  return (
    <ToastContext.Provider
      value={useMemo(
        () => ({
          error: handleDispatchError,
          info: handleDispatchInfo,
          success: handleDispatchSuccess,
          promise: handleDispatchPromise,
        }),
        [handleDispatchError, handleDispatchInfo, handleDispatchSuccess, handleDispatchPromise]
      )}
    >
      <Toast.Provider duration={toastDurations.quick}>
        {children}
        {Array.from(toasts).map(([key, toast]) => (
          <ToastItem key={key} toast={toast} onClose={() => handleRemoveToast(key)} />
        ))}
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export { ToastsProvider };
