import { Box, styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

interface WalletConnectionModalProps {
  isOpen: boolean;
}
export function WalletConnectionModal({ isOpen }: WalletConnectionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* <Box position="fixed" inset="0" bg="black/30" backdropFilter="blur(4px)" zIndex={40} /> */}
      <Box
        position="fixed"
        inset="0"
        display="flex"
        alignItems="center"
        justifyContent="center"
        pointerEvents="none"
      >
        <Box
          bg="ink.background-primary"
          p="space.06"
          borderRadius="md"
          boxShadow="0 0 2px 0 rgba(18, 16, 15, 0.12), 0 4px 8px 0 rgba(18, 16, 15, 0.08), 0 12px 24px 0 rgba(18, 16, 15, 0.08)"
        >
          <Flag
            spacing="space.05"
            img={<styled.img src="/images/extension-logo.svg" alt="Leather logo" />}
          >
            <styled.h2 textStyle="heading.05">Get started with Leather</styled.h2>
            <styled.p textStyle="body.02">
              Connected your leather wallet to access your portfolio
            </styled.p>
          </Flag>
          <Box mt="space.05">
            <Flag border="default" borderRadius="99px">
              Connect your Leather wallet Connect your Leather wallet to access your portfolio
            </Flag>
          </Box>
        </Box>
      </Box>
    </>
  );
}
