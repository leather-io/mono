import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

export function TokenDetailsHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <Header px={{ base: 'space.03', md: 'space.00' }}>
      <Box width="100%" maxWidth={{ base: '100%', md: '780px' }} margin="0 auto">
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={() => navigate(-1)}
              dataTestId="token-details-back"
            />
          }
          centerCol={<styled.span textStyle="heading.05">{title}</styled.span>}
          rightCol={<Box />}
        />
      </Box>
    </Header>
  );
}

export function TokenDetailsPillButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick(): void;
  disabled?: boolean;
}) {
  return (
    <styled.button
      type="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="space.03"
      py="space.02"
      height="36px"
      minWidth="78px"
      bg="ink.background-primary"
      border="default"
      borderRadius="999px"
      textStyle="label.02"
      color={disabled ? 'ink.text-subdued' : 'ink.text-primary'}
      opacity={disabled ? 0.6 : 1}
      _hover={disabled ? undefined : { bg: 'ink.component-background-hover', cursor: 'pointer' }}
      onClick={disabled ? undefined : onClick}
    >
      {label}
    </styled.button>
  );
}

export function TokenDetailsActionsRow({
  symbol,
  isBuyEnabled = true,
  isSwapEnabled = true,
}: {
  symbol: string;
  isBuyEnabled?: boolean;
  isSwapEnabled?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const receivePath = symbol === 'BTC' ? `/${RouteUrls.ReceiveBtc}` : `/${RouteUrls.ReceiveStx}`;
  const swapChain = symbol === 'BTC' ? 'bitcoin' : 'stacks';

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        void navigate(url);
      },
      popup() {
        void openIndexPageInNewTab(url);
      },
    })();
  }

  return (
    <Flex
      gap="space.02"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      px="space.05"
      pb="space.01"
      width="100%"
      maxWidth="390px"
      margin="0 auto"
    >
      <TokenDetailsPillButton
        label="Send"
        onClick={() => void navigate(RouteUrls.SendCryptoAsset)}
      />
      <TokenDetailsPillButton
        label="Receive"
        onClick={() => void navigate(receivePath, { state: { backgroundLocation: location } })}
      />
      <TokenDetailsPillButton
        label="Buy"
        disabled={!isBuyEnabled}
        onClick={() => pageModeRoutingAction(RouteUrls.Fund)}
      />
      <TokenDetailsPillButton
        label="Swap"
        disabled={!isSwapEnabled}
        onClick={() =>
          void navigate(
            RouteUrls.Swap.replace('{chain}', swapChain)
              .replace(':base', symbol)
              .replace(':quote?', '')
          )
        }
      />
    </Flex>
  );
}

export function TokenDetailsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack bg="ink.background-primary" py="space.03" width="100%">
      <Box px="space.05" py="space.02">
        <styled.span textStyle="label.03">{title}</styled.span>
      </Box>
      {children}
    </Stack>
  );
}

export function TokenDetailsRow({
  label,
  value,
  valueAction,
}: {
  label: string;
  value: ReactNode;
  valueAction?(): void;
}) {
  return (
    <Flex
      px="space.05"
      py="space.01"
      alignItems="center"
      justifyContent="space-between"
      minHeight="30px"
    >
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.span>
      {valueAction ? (
        <styled.button
          type="button"
          textStyle="caption.02"
          textDecoration="underline"
          _hover={{ cursor: 'pointer' }}
          onClick={valueAction}
        >
          {value}
        </styled.button>
      ) : (
        <styled.span textStyle="caption.02">{value}</styled.span>
      )}
    </Flex>
  );
}

export function TokenDetailsBalanceItem({
  title,
  address,
  rightTop,
  rightBottom,
}: {
  title: string;
  address?: string;
  rightTop: ReactNode;
  rightBottom?: ReactNode;
}) {
  return (
    <Flex
      px="space.05"
      py="space.03"
      alignItems="center"
      justifyContent="space-between"
      gap="space.04"
    >
      <Stack gap="space.00" minWidth="0">
        <styled.span textStyle="label.02">{title}</styled.span>
        {address ? (
          <styled.span textStyle="caption.02" color="ink.text-subdued" textDecoration="underline">
            {truncateMiddle(address, 6)}
          </styled.span>
        ) : null}
      </Stack>
      <Stack gap="space.00" alignItems="flex-end">
        <styled.span textStyle="label.02">{rightTop}</styled.span>
        {rightBottom ? (
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            {rightBottom}
          </styled.span>
        ) : null}
      </Stack>
    </Flex>
  );
}

export function TokenDetailsHero({
  icon,
  amount,
  amountSuffix,
  fiatAmount,
  actions,
}: {
  icon: ReactNode;
  amount: string;
  amountSuffix?: string;
  fiatAmount?: string;
  actions?: ReactNode;
}) {
  return (
    <Stack
      bg="ink.background-primary"
      alignItems="center"
      justifyContent="center"
      p="space.05"
      gap="space.03"
    >
      <Box>{icon}</Box>
      <Stack gap="space.00" alignItems="center">
        <styled.div textStyle="heading.03">
          {amount}{' '}
          {amountSuffix ? <styled.span color="ink.text-subdued">{amountSuffix}</styled.span> : null}
        </styled.div>
        {fiatAmount ? (
          <styled.div textStyle="label.01" color="ink.text-primary">
            {fiatAmount}
          </styled.div>
        ) : null}
      </Stack>
      {actions}
    </Stack>
  );
}

export function TokenDetailsScreen({
  title,
  hero,
  children,
}: {
  title: string;
  hero: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack width="100%" gap="space.00">
      <TokenDetailsHeader title={title} />
      <Box width="100%" maxWidth={{ base: '100%', md: '780px' }} margin="0 auto">
        <Stack
          bg="ink.background-secondary"
          borderRadius={{ base: '0', md: 'md' }}
          overflow="hidden"
        >
          {hero}
          {children}
        </Stack>
      </Box>
    </Stack>
  );
}
