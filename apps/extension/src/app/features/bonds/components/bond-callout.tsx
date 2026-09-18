import { useState } from 'react';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import type { BtcBondEnrollmentWindow, BtcStakingPosition } from '@leather.io/models';
import { Callout } from '@leather.io/ui';

import { BITCOIN_STAKING_URL } from '@shared/constants';
import { logger } from '@shared/logger';

import { formatCurrency } from '@app/common/currency-formatter';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import {
  useBtcBondEnrollmentWindow,
  useCurrentBtcStakingPositions,
} from '@app/query/bitcoin/staking/bitcoin-staking.hooks';

import {
  daysUntil,
  findEndingSoonPosition,
  findMaturedPosition,
  formatShortDate,
} from '../bond-position.utils';

type BondCalloutVariant = 'unlocks-soon' | 'unlocked';

interface BondCalloutLayoutProps {
  variant: BondCalloutVariant;
  title: string;
  body: string;
  primaryActionLabel: string;
  onPrimaryAction(): void;
  onDismiss(): void;
}

function BondCalloutLayout({
  variant,
  title,
  body,
  primaryActionLabel,
  onPrimaryAction,
  onDismiss,
}: BondCalloutLayoutProps) {
  return (
    <Callout
      variant={variant === 'unlocked' ? 'success' : 'warning'}
      title={title}
      data-testid={BondsSelectors.BondCallout}
      borderRadius="md"
    >
      <Flex direction="column" gap="space.02" alignItems="flex-start">
        <styled.span>{body}</styled.span>
        <Flex gap="space.04">
          <styled.button
            type="button"
            textStyle="label.03"
            textDecoration="underline"
            _hover={{ cursor: 'pointer' }}
            onClick={onPrimaryAction}
            data-testid={BondsSelectors.BondCalloutPrimaryAction}
          >
            {primaryActionLabel}
          </styled.button>
          <styled.button
            type="button"
            textStyle="label.03"
            textDecoration="underline"
            _hover={{ cursor: 'pointer' }}
            onClick={onDismiss}
            data-testid={BondsSelectors.BondCalloutDismiss}
          >
            Dismiss
          </styled.button>
        </Flex>
      </Flex>
    </Callout>
  );
}

interface BondCalloutModel {
  variant: BondCalloutVariant;
  position: BtcStakingPosition;
  title: string;
  body: string;
  primaryActionLabel: string;
}

function getBondCallout(
  positions: BtcStakingPosition[],
  window: BtcBondEnrollmentWindow | null,
  now = new Date()
): BondCalloutModel | null {
  const matured = findMaturedPosition(positions);
  if (matured) {
    const amount = formatCurrency(matured.amount, { preset: 'pad-decimals' });
    const next = window
      ? ` Period ${window.bondIndex} is open until ${formatShortDate(window.estimatedClosesAt)} if you want to go again.`
      : '';
    return {
      variant: 'unlocked',
      position: matured,
      title: 'Your bond has unlocked',
      body: `${amount} came back to you on ${formatShortDate(matured.estimatedUnlockAt)} and is spendable now.${next}`,
      primaryActionLabel: 'Bond again',
    };
  }

  const endingSoon = findEndingSoonPosition(positions, now);
  if (endingSoon) {
    const days = daysUntil(endingSoon.estimatedUnlockAt, now);
    const when = window
      ? `before ${formatShortDate(window.estimatedClosesAt)}`
      : 'in the next registration window';
    return {
      variant: 'unlocks-soon',
      position: endingSoon,
      title: `Your bond unlocks in ${days} ${days === 1 ? 'day' : 'days'}`,
      body: `Bitcoin does not re-lock itself. To stay in for the next period, sign a new timelock ${when} in Bitcoin Staking.`,
      primaryActionLabel: 'Sign a new timelock',
    };
  }

  return null;
}

const dismissedCalloutStorageKey = 'leather-bond-callout-dismissed';

function readDismissedCallouts(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(dismissedCalloutStorageKey) ?? '[]');
    return Array.isArray(stored) ? stored.filter(key => typeof key === 'string') : [];
  } catch {
    return [];
  }
}

function persistDismissedCallout(key: string) {
  try {
    const dismissed = new Set(readDismissedCallouts()).add(key);
    localStorage.setItem(dismissedCalloutStorageKey, JSON.stringify([...dismissed]));
  } catch {
    logger.warn('Unable to persist the dismissed bond callout');
  }
}

export function BondCallout() {
  const positions = useCurrentBtcStakingPositions();
  const window = useBtcBondEnrollmentWindow();
  const [dismissedKeys, setDismissedKeys] = useState(readDismissedCallouts);

  if (positions.state !== 'success') return null;

  const callout = getBondCallout(positions.value, window.state === 'success' ? window.value : null);
  if (!callout) return null;

  // Keyed by address, bond and state: one account's dismissal must not silence
  // another's, and "unlocked" still shows after "unlocks soon" was dismissed
  const dismissalKey = `${callout.position.stxAddress}:${callout.position.bondIndex}:${callout.variant}`;
  if (dismissedKeys.includes(dismissalKey)) return null;

  return (
    <BondCalloutLayout
      variant={callout.variant}
      title={callout.title}
      body={callout.body}
      primaryActionLabel={callout.primaryActionLabel}
      onPrimaryAction={() => openInNewTab(BITCOIN_STAKING_URL)}
      onDismiss={() => {
        persistDismissedCallout(dismissalKey);
        setDismissedKeys(keys => [...keys, dismissalKey]);
      }}
    />
  );
}
