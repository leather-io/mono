import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import {
  ArrowDownIcon,
  ArrowRotateClockwiseIcon,
  ArrowUpIcon,
  ListContainer,
  PlusIcon,
} from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { Badge } from '../../components/badge';
import { SectionLabel } from '../../components/section-label';
import type { Chain } from '../../data/multisig-types';

interface BackdropVault {
  name: string;
  chain: Chain;
  icon: string;
  themeId: number;
  caption: string;
  fiat?: string;
  crypto?: string;
  badge?: string;
}

const backdropVaults: BackdropVault[] = [
  {
    name: 'Treasury',
    chain: 'btc',
    icon: 'bank',
    themeId: 0,
    caption: 'Bitcoin vault · 3 accounts',
    fiat: '$248,910.24',
    crypto: '2.41 BTC',
  },
  {
    name: 'Grants',
    chain: 'stx',
    icon: 'gift',
    themeId: 2,
    caption: 'Stacks vault · 2 accounts',
    fiat: '$31,204.80',
    crypto: '42,500 STX',
  },
  {
    name: 'Ops reserve',
    chain: 'btc',
    icon: 'piggybank',
    themeId: 1,
    caption: 'Bitcoin vault · Invited by SP2J…9KQR',
    badge: 'Invitation',
  },
];

interface BackdropActivity {
  title: string;
  caption: string;
  amount: string;
  subAmount: string;
  direction: 'sent' | 'received' | 'pending';
}

const backdropActivity: BackdropActivity[] = [
  {
    title: 'Sent bitcoin',
    caption: 'Treasury · Payroll',
    amount: '-0.0420 BTC',
    subAmount: '2 hours ago',
    direction: 'sent',
  },
  {
    title: 'Awaiting signatures',
    caption: 'Grants · 2 of 3',
    amount: '-1,200 STX',
    subAmount: 'Yesterday',
    direction: 'pending',
  },
  {
    title: 'Received bitcoin',
    caption: 'Treasury · Cold storage',
    amount: '+0.1850 BTC',
    subAmount: '3 days ago',
    direction: 'received',
  },
  {
    title: 'Sent STX',
    caption: 'Grants · Contributor',
    amount: '-8,000 STX',
    subAmount: '5 days ago',
    direction: 'sent',
  },
];

const activityIcon = {
  sent: ArrowUpIcon,
  received: ArrowDownIcon,
  pending: ArrowRotateClockwiseIcon,
} as const;

const amountColor = {
  sent: 'ink.text-primary',
  received: 'green.action-primary-default',
  pending: 'ink.text-subdued',
} as const;

function BackdropVaultCard({ vault }: { vault: BackdropVault }) {
  return (
    <Flex
      alignItems="center"
      gap="space.04"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      bgImage={vault.badge ? 'var(--multisig-collecting-wash)' : undefined}
    >
      <AvatarSq chain={vault.chain} icon={vault.icon} themeId={vault.themeId} size="md" />
      <Box flex={1} minWidth={0}>
        <styled.p textStyle="heading.05">{vault.name}</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          {vault.caption}
        </styled.p>
      </Box>
      {vault.badge ? (
        <Badge variant="pending" label={vault.badge} />
      ) : (
        <Box textAlign="right">
          <styled.p textStyle="heading.05">{vault.fiat}</styled.p>
          <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
            {vault.crypto}
          </styled.p>
        </Box>
      )}
    </Flex>
  );
}

function BackdropActivityRow({ item }: { item: BackdropActivity }) {
  const Icon = activityIcon[item.direction];
  return (
    <Flex alignItems="center" gap="space.03" px="space.03" py="space.03">
      <Circle size="40px" bg="ink.component-background-default" flexShrink={0}>
        <Icon variant="small" />
      </Circle>
      <Box flex={1} minWidth={0}>
        <styled.p textStyle="label.02">{item.title}</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          {item.caption}
        </styled.p>
      </Box>
      <Box textAlign="right">
        <styled.p textStyle="label.02" color={amountColor[item.direction]}>
          {item.amount}
        </styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          {item.subAmount}
        </styled.p>
      </Box>
    </Flex>
  );
}

// Decorative stand-in for the signed-in dashboard, blurred behind the connect
// card. Static markup because the real VaultCard and VaultActivityList are
// query-driven and need a session.
export function MultisigOnboardingBackdrop() {
  return (
    <Box aria-hidden="true" mt="space.08" minHeight="70vh">
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <SectionLabel noGutter>My vaults</SectionLabel>
          <Flex direction="column" gap="space.03">
            {backdropVaults.map(vault => (
              <BackdropVaultCard key={vault.name} vault={vault} />
            ))}
            <Flex
              alignItems="center"
              justifyContent="center"
              gap="space.02"
              width="100%"
              p="space.04"
              borderRadius="md"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="ink.border-default"
              color="ink.text-primary"
              textStyle="label.02"
            >
              <PlusIcon variant="small" />
              Create new vault
            </Flex>
          </Flex>
        </Box>
        <Box flex={['1', '1', '1']} width="100%" maxWidth={['unset', 'unset', '450px']}>
          <SectionLabel noGutter>Activity</SectionLabel>
          <ListContainer>
            {backdropActivity.map(item => (
              <BackdropActivityRow key={item.title} item={item} />
            ))}
          </ListContainer>
        </Box>
      </Flex>
    </Box>
  );
}
