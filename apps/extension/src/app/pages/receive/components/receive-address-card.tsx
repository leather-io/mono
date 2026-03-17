import { ReactElement, useEffect, useRef, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

import {
  AddressDisplayer,
  CheckmarkIcon,
  IconButton,
  InfoCircleIcon,
  QrCodeIcon,
  Tooltip,
} from '@leather.io/ui';

interface ReceiveAddressCardProps {
  title: string;
  tooltipText: string;
  address: string;
  balance?: string;
  copyButtonColor: string;
  copyButtonIcon: ReactElement;
  onCopyAddress(): void;
  onClickQrCode?(): void;
  qrCodeTestId?: string;
}

export function ReceiveAddressCard({
  title,
  tooltipText,
  address,
  balance,
  copyButtonColor,
  copyButtonIcon,
  onCopyAddress,
  onClickQrCode,
  qrCodeTestId,
}: ReceiveAddressCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleCopy() {
    onCopyAddress();
    setHasCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHasCopied(false), 1000);
  }

  return (
    <Box
      data-card=""
      bg="ink.background-secondary"
      rounded="lg"
      p="space.03"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={{ bg: 'ink.component-background-hover' }}
      onClick={handleCopy}
    >
      <Flex direction="column" gap="space.01">
        <Flex alignItems="flex-start" gap="space.01">
          <Flex alignItems="center" gap="space.01">
            <styled.span textStyle="label.01">{title}</styled.span>
            <Tooltip.Provider delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <styled.button
                    cursor="pointer"
                    display="inline-flex"
                    alignItems="center"
                    bg="transparent"
                    border="0"
                    p="0"
                    lineHeight="0"
                  >
                    <InfoCircleIcon variant="small" color="ink.text-subdued-secondary" />
                  </styled.button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={5}
                    collisionPadding={20}
                    style={{ zIndex: 9999 }}
                  >
                    {tooltipText}
                    <Tooltip.Arrow />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </Flex>
          {onClickQrCode && (
            <IconButton
              data-testid={qrCodeTestId}
              icon={<QrCodeIcon />}
              onClick={onClickQrCode}
              ml="auto"
              h="32px"
              w="32px"
              p="space.01"
            />
          )}
        </Flex>

        <Flex direction="column" gap="space.03">
          <Box maxW="70%">
            <AddressDisplayer address={address} />
          </Box>
          <Flex justifyContent="space-between" alignItems="end">
            <styled.button
              onClick={e => {
                e.stopPropagation();
                handleCopy();
              }}
              cursor="pointer"
              position="relative"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              gap="space.02"
              h="32px"
              px="space.03"
              rounded="round"
              border="1px solid"
              borderColor="ink.border-transparent"
              overflow="hidden"
              style={{ backgroundColor: copyButtonColor, color: 'white' }}
              _hover={{ opacity: 0.8 }}
            >
              <Box position="relative" w="16px" h="16px" flexShrink={0}>
                <Flex
                  position="absolute"
                  inset="0"
                  alignItems="center"
                  justifyContent="center"
                  transition="opacity 0.2s ease, transform 0.2s ease"
                  style={{
                    opacity: hasCopied ? 0 : 1,
                    transform: hasCopied ? 'scale(0.8)' : 'scale(1)',
                  }}
                >
                  {copyButtonIcon}
                </Flex>
                <Flex
                  position="absolute"
                  inset="0"
                  alignItems="center"
                  justifyContent="center"
                  transition="opacity 0.2s ease, transform 0.2s ease"
                  style={{
                    opacity: hasCopied ? 1 : 0,
                    transform: hasCopied ? 'scale(1)' : 'scale(0.8)',
                  }}
                >
                  <CheckmarkIcon variant="small" color="ink.background-primary" />
                </Flex>
              </Box>
              <Box position="relative" overflow="hidden">
                <styled.span
                  textStyle="label.02"
                  transition="opacity 0.2s ease, transform 0.2s ease"
                  display="block"
                  style={{
                    opacity: hasCopied ? 0 : 1,
                    transform: hasCopied ? 'translateY(-100%)' : 'translateY(0)',
                  }}
                >
                  Copy address
                </styled.span>
                <styled.span
                  textStyle="label.02"
                  position="absolute"
                  top="0"
                  left="0"
                  transition="opacity 0.2s ease, transform 0.2s ease"
                  display="block"
                  style={{
                    opacity: hasCopied ? 1 : 0,
                    transform: hasCopied ? 'translateY(0)' : 'translateY(100%)',
                  }}
                >
                  Copied address
                </styled.span>
              </Box>
            </styled.button>
            {balance && (
              <styled.span textStyle="caption.01" color="ink.text-subdued-secondary">
                {balance}
              </styled.span>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
