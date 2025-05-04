import QRCode from 'react-native-qrcode-svg';

import { Box, ThemeProvider } from '@leather.io/ui/native';

interface QrCardProps {
  value: string;
}

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
          >
            <QRCode
              value={value}
              logoSize={36}
              logo={require('./qr-leather-lettermark.png')}
              size={190}
              logoMargin={8}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
