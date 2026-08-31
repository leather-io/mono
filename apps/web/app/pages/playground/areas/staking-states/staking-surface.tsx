import { type ReactNode, useEffect, useState } from 'react';

import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { Pox5TxTrackerProvider } from '~/features/bitcoin-staking/components/pox5-tx-tracker-provider';
import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { SignInSlotProvider } from '~/layouts/page/sign-in-slot';
import { useLeatherConnect } from '~/store/addresses';

import {
  type StakingSurfaceSeed,
  createSeededQueryClient,
  mockAddresses,
} from './staking-mock-data';

function useMockWallet() {
  const { stacksAccount, setAddresses } = useLeatherConnect();

  useEffect(() => {
    if (stacksAccount) return;
    setAddresses(mockAddresses);
  }, [stacksAccount, setAddresses]);

  return {
    address: stacksAccount?.address ?? null,
    disconnect() {
      setAddresses([]);
    },
  };
}

function usePauseNetworkReads() {
  useState(() => onlineManager.setOnline(false));

  useEffect(() => {
    onlineManager.setOnline(false);
    return () => onlineManager.setOnline(true);
  }, []);
}

interface StakingSurfaceProps {
  seed?: StakingSurfaceSeed;
  children: ReactNode;
}

export function StakingSurface({ seed, children }: StakingSurfaceProps) {
  const [queryClient] = useState(() => createSeededQueryClient(seed));

  return (
    <QueryClientProvider client={queryClient}>
      <StackingClientProvider>
        <SignInSlotProvider slot={<></>}>
          <Pox5TxTrackerProvider>{children}</Pox5TxTrackerProvider>
        </SignInSlotProvider>
      </StackingClientProvider>
    </QueryClientProvider>
  );
}

interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <Stack gap="space.06">
      <Stack gap="space.02" maxWidth="70ch">
        <styled.h2 textStyle="heading.04">{title}</styled.h2>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {description}
        </styled.p>
      </Stack>
      {children}
    </Stack>
  );
}

interface BoardProps {
  label: string;
  note: string;
  route?: string;
  children: ReactNode;
}

export function Board({ label, note, route, children }: BoardProps) {
  return (
    <Stack gap="space.03">
      <Stack gap="space.01" maxWidth="70ch">
        <Flex alignItems="baseline" gap="space.03" flexWrap="wrap">
          <styled.h3 textStyle="label.02">{label}</styled.h3>
          {route && (
            <styled.code textStyle="caption.02" color="ink.text-subdued">
              {route}
            </styled.code>
          )}
        </Flex>
        <styled.p
          textStyle="caption.01"
          color="ink.text-subdued"
          borderLeft="default"
          pl="space.03"
        >
          {note}
        </styled.p>
      </Stack>
      <Box
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="md"
        px="space.05"
        py="space.04"
        overflowX="auto"
      >
        {children}
      </Box>
    </Stack>
  );
}

interface StakingPlaygroundShellProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function StakingPlaygroundShell({
  title = 'Bitcoin staking surfaces',
  description = 'Every pox-5 screen a staker can land on, stacked in the order they meet them, each in the states that change the design. The components are the ones that ship — only the data is mocked — so anything changed here is changed in the feature.',
  children,
}: StakingPlaygroundShellProps) {
  usePauseNetworkReads();
  const { address, disconnect } = useMockWallet();

  return (
    <Stack gap="space.11" pb="space.11">
      <Stack gap="space.03" maxWidth="70ch">
        <styled.h1 textStyle="heading.03">{title}</styled.h1>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          {description}
        </styled.p>
        <Flex alignItems="center" gap="space.03" flexWrap="wrap">
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {address ? `Mock wallet ${address}` : 'Connecting mock wallet…'} · reads paused, no
            network
          </styled.p>
          {address && (
            <styled.button
              type="button"
              onClick={disconnect}
              textStyle="caption.01"
              color="ink.text-subdued"
              textDecoration="underline"
              cursor="pointer"
              bg="transparent"
            >
              Disconnect
            </styled.button>
          )}
        </Flex>
      </Stack>
      {address ? children : null}
    </Stack>
  );
}
