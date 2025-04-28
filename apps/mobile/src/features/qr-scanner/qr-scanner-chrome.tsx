import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QrScannerFrame } from '@/features/qr-scanner/qr-scanner-frame';
import { HEADER_HEIGHT } from '@/shared/constants';
import { t } from '@lingui/macro';

import { ArrowLeftIcon, Box, IconButton, Text } from '@leather.io/ui/native';

interface QrScannerOverlayProps {
  onClose: () => void;
  errorMessage?: string;
}

export function QrScannerChrome({ onClose, errorMessage }: QrScannerOverlayProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0}>
      <QrScannerFrame state={errorMessage ? 'error' : 'default'} />

      <Box justifyContent="center" width="100%" style={{ paddingTop: insets.top }}>
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          height={HEADER_HEIGHT}
          py="3"
          px="3"
        >
          <Box zIndex="20">
            <IconButton
              onPress={onClose}
              label={t({ id: 'qr_scanner.back_button', message: 'Close the scanner' })}
              icon={<ArrowLeftIcon />}
            />
          </Box>
          <Box
            alignItems="center"
            justifyContent="center"
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
          >
            <Text variant="heading05">
              {t({
                id: 'qr_scanner.title',
                message: 'Scan QR Code',
              })}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
