import QRCode from 'react-native-qrcode-svg';

import { Image } from 'expo-image';

import { Box, ThemeProvider } from '@leather.io/ui/native';

interface QrCardProps {
  value: string;
}

const qrSize = 190;
const logoSize = 52;

export function QrCard({ value }: QrCardProps) {
  return (
    <ThemeProvider theme="light">
      <Box
        shadowColor="ink.background-overlay"
        shadowOpacity={0.1}
        shadowOffset={{ width: 0, height: 0 }}
        shadowRadius={2}
        backgroundColor="ink.background-primary"
        width={238}
        height={238}
        alignSelf="center"
        borderRadius="md"
        elevation={8}
      >
        <Box
          shadowColor="ink.background-overlay"
          shadowOpacity={0.1}
          shadowOffset={{ width: 0, height: 4 }}
          shadowRadius={8}
          backgroundColor="ink.background-primary"
          borderRadius="md"
        >
          <Box
            shadowColor="ink.background-overlay"
            shadowOpacity={0.1}
            shadowOffset={{ width: 0, height: 12 }}
            shadowRadius={24}
            padding="5"
            backgroundColor="ink.background-primary"
            borderRadius="md"
            alignItems="center"
            justifyContent="center"
          >
            <QRCode value={value} size={qrSize} />
            <Image
              source={require('./qr-leather-lettermark.png')}
              style={{ position: 'absolute', width: logoSize, height: logoSize }}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
