import { useRef, useState } from 'react';

import { QrScannerCamera } from '@/features/qr-scanner/qr-scanner-camera';
import { QrScannerChrome } from '@/features/qr-scanner/qr-scanner-chrome';
import { type BarcodeScanningResult } from 'expo-camera';

import { Box, ThemeProvider, useHaptics } from '@leather.io/ui/native';

export type ParserResult<T> = { success: true; data: T } | { success: false; error: string };

interface QrScannerProps<T> {
  parse: (data: string) => ParserResult<T>;
  onScanned: (result: T) => void;
  onClose: () => void;
}

export function QrScanner<T>({ onClose, onScanned, parse }: QrScannerProps<T>) {
  const lastSuccessfulScan = useRef(false);
  const { showError, error } = useTransientQrError();
  const triggerHaptics = useHaptics();

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (lastSuccessfulScan.current) {
      return;
    }

    const parserResult = parse(result.data);

    if (parserResult.success) {
      lastSuccessfulScan.current = true;
      onScanned(parserResult.data);
      void triggerHaptics('success');
    } else {
      showError(parserResult.error);
    }
  }

  return (
    <ThemeProvider theme="dark">
      <Box bg="ink.background-primary" flex={1}>
        <QrScannerCamera onBarcodeScanned={handleBarcodeScanned} />
        <QrScannerChrome onClose={onClose} errorMessage={error} />
      </Box>
    </ThemeProvider>
  );
}

function useTransientQrError() {
  const autoClearDelay = 150;
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const triggerHaptics = useHaptics();
  const shouldTriggerHapticsRef = useRef(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function showError(message: string) {
    clearTimeout(errorTimeoutRef.current);

    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(undefined);
      shouldTriggerHapticsRef.current = true;
    }, autoClearDelay);

    setErrorMessage(message);

    if (shouldTriggerHapticsRef.current) {
      void triggerHaptics('error');
      shouldTriggerHapticsRef.current = false;
    }
  }

  return {
    error: errorMessage,
    showError,
  };
}
