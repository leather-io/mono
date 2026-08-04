import { useLocation, useNavigate } from 'react-router';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { z } from 'zod';

import { Button, ExternalLinkIcon, Flag, InfoCircleIcon, Tooltip } from '@leather.io/ui';

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
  onCancel?(): void;
}

export function OutdatedStacksAppWarningBase({
  onTryAgain,
  onCancel,
}: OutdatedStacksAppWarningBaseProps) {
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
        <img src="assets/images/ledger/outdated-stacks-app.svg" width="292px" alt="Ledger" />
      </Box>
      <Flex alignItems="center" gap="space.02" justifyContent="center" mt="space.06">
        <LedgerTitle>Ledger Stacks app update required</LedgerTitle>
      </Flex>
      <styled.p mt="space.04" textStyle="body.01" maxW="320px">
        {versionInfo
          ? `Your current Stacks app version (${versionInfo.currentVersion}) isn't supported. Update to the latest version (${versionInfo.requiredVersion}) to continue.`
          : 'Leather needs a more recent version of the Ledger Stacks app to continue.'}
      </styled.p>

      <Stack gap="space.04" mt="space.06" width="100%" maxW="360px" textAlign="left">
        <Flag
          align="middle"
          img={
            <Flex
              alignItems="center"
              justifyContent="center"
              width="40px"
              height="40px"
              borderRadius="round"
              border="1px solid"
              borderColor="ink.border-default"
              flexShrink={0}
            >
              <styled.span textStyle="label.02">1</styled.span>
            </Flex>
          }
        >
          <styled.span textStyle="body.01">
            Open Ledger Wallet → My Ledger and{' '}
            <Tooltip.Root delayDuration={0}>
              <Tooltip.Trigger asChild>
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  gap="space.01"
                  cursor="pointer"
                >
                  update the Stacks app
                  <InfoCircleIcon variant="small" />
                </styled.span>
              </Tooltip.Trigger>
              <Tooltip.Content side="top" sideOffset={5}>
                <Tooltip.Arrow />
                You may have to Update your Ledger device's firmware to access the latest version of
                the Stacks app
              </Tooltip.Content>
            </Tooltip.Root>
          </styled.span>
        </Flag>
        <Flag
          align="middle"
          img={
            <Flex
              alignItems="center"
              justifyContent="center"
              width="40px"
              height="40px"
              borderRadius="round"
              border="1px solid"
              borderColor="ink.border-default"
              flexShrink={0}
            >
              <styled.span textStyle="label.02">2</styled.span>
            </Flex>
          }
        >
          <styled.span textStyle="body.01">Reconnect your Ledger and try again</styled.span>
        </Flag>
      </Stack>

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
          Open Ledger Live <ExternalLinkIcon color="ink.background-primary" />
        </styled.a>
        <HStack gap="space.03" width="100%">
          <Button flex={1} onClick={onTryAgain} variant="outline">
            Try again
          </Button>
          <Button flex="1" onClick={onCancel ?? (() => navigate('../../'))} variant="outline">
            Cancel
          </Button>
        </HStack>
      </Stack>
    </LedgerWrapper>
  );
}
