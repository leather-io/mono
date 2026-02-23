import { useLocation, useNavigate } from 'react-router';

import GenericErrorImg from '@assets/images/generic-error.png';
import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';

import { Button, InfoCircleIcon, Tooltip } from '@leather.io/ui';

import { useThemeSwitcher } from '@app/common/theme-provider';
import { whenTheme } from '@app/common/utils/when-theme';
import { LedgerTitle } from '@app/features/ledger/components/ledger-title';
import { LedgerWrapper } from '@app/features/ledger/components/ledger-wrapper';
import { LEDGER_LIVE_MANAGER_URL } from '@app/features/ledger/utils/generic-ledger-utils';

const locationStateSchema = z.object({
  versionInfo: z
    .object({
      currentVersion: z.string(),
      requiredVersion: z.string(),
    })
    .optional(),
});

interface OutdatedStacksAppWarningBaseProps {
  onTryAgain(): void | Promise<void>;
}

export function OutdatedStacksAppWarningBase({ onTryAgain }: OutdatedStacksAppWarningBaseProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useThemeSwitcher();

  const parseResult = locationStateSchema.safeParse(location.state);
  const versionInfo = parseResult.success ? parseResult.data.versionInfo : undefined;

  const ledgerIconStyle = whenTheme(theme)({
    light: { filter: 'invert(1)' },
    dark: {},
  });

  return (
    <LedgerWrapper>
      <Box mx="space.02">
        <img src={GenericErrorImg} width="106px" />
      </Box>
      <Flex alignItems="center" gap="space.02" justifyContent="center" mt="space.06">
        <LedgerTitle>Update your Ledger Stacks app</LedgerTitle>
      </Flex>
      <styled.p color="ink.text-subdued" mt="space.04" textStyle="body.02">
        Leather needs a more recent version of the Ledger Stacks app
      </styled.p>

      {versionInfo && (
        <Stack gap="space.03" mt="space.03" textStyle="label.02">
          <Flex alignItems="center" justifyContent="space-between">
            <styled.span>
              Current version{' '}
              <styled.span textStyle="code">{versionInfo.currentVersion}</styled.span>
            </styled.span>
            <styled.span mx="space.01">∙</styled.span>
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger asChild>
                <Flex alignItems="center" gap="space.01" cursor="pointer">
                  <styled.span>
                    Required version{' '}
                    <styled.span textStyle="code">{versionInfo.requiredVersion}</styled.span>
                  </styled.span>
                  <InfoCircleIcon variant="small" />
                </Flex>
              </Tooltip.Trigger>
              <Tooltip.Content side="top" sideOffset={5}>
                <Tooltip.Arrow />
                You may have to Update your Ledger device's firmware to access the latest version of
                the Stacks app
              </Tooltip.Content>
            </Tooltip.Root>
          </Flex>
        </Stack>
      )}

      <styled.p
        color="ink.text-subdued"
        mt="space.03"
        mx="space.02"
        textStyle="body.02"
        maxW="400px"
      >
        Open Ledger Wallet, go to My Ledger, and update the Stacks app on your device to the latest
        version.
      </styled.p>

      <Stack gap="space.03" mb="space.05" mt="space.06" width="100%">
        <styled.a
          alignItems="center"
          bg="ink.text-primary"
          borderRadius="round"
          color="ink.background-primary"
          cursor="pointer"
          display="inline-flex"
          gap="space.02"
          height="48px"
          href={LEDGER_LIVE_MANAGER_URL}
          justifyContent="center"
          px="space.04"
          textAlign="center"
          textDecoration="none"
          textStyle="label.02"
          whiteSpace="nowrap"
          _hover={{ opacity: 0.9 }}
          _active={{ opacity: 0.8 }}
        >
          <img
            alt="Ledger"
            height="20"
            src="assets/images/ledger/ledger-favicon.webp"
            style={{ imageRendering: 'pixelated', ...ledgerIconStyle }}
            width="20"
          />
          Open Ledger Wallet ↗
        </styled.a>
        <HStack gap="space.03" width="100%">
          <Button flex={1} onClick={onTryAgain} variant="outline">
            Try again
          </Button>
          <Button flex="1" onClick={() => navigate('../../')} variant="outline">
            Cancel
          </Button>
        </HStack>
      </Stack>
    </LedgerWrapper>
  );
}
