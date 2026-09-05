import { useState } from 'react';

import { BondsSelectors } from '@tests/selectors/bonds.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { Callout } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';

import type { BondContext, BondPosition } from '../bond-position.model';
import {
  bondLockedBtc,
  daysUntil,
  formatEstimatedDate,
  formatPeriodName,
  isEndingSoon,
} from '../bond-position.utils';
import { bitcoinStakingUrl } from '../bonds.constants';
import { useBondPosition } from '../use-bond-position';

export type BondCalloutVariant = 'unlocks-soon' | 'unlocked';

interface BondCalloutLayoutProps {
  variant: BondCalloutVariant;
  title: string;
  body: string;
  primaryActionLabel: string;
  onPrimaryAction(): void;
  onDismiss(): void;
}

export function BondCalloutLayout({
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

export function getBondCalloutVariant(ctx: BondContext): BondCalloutVariant | null {
  if (!ctx.position) return null;
  if (ctx.position.status === 'unlocked') return 'unlocked';
  if (isEndingSoon(ctx.position, ctx)) return 'unlocks-soon';
  return null;
}

interface BondCalloutCopy {
  title: string;
  body: string;
  primaryActionLabel: string;
}

export function getBondCalloutCopy(
  variant: BondCalloutVariant,
  position: BondPosition,
  ctx: BondContext
): BondCalloutCopy {
  const amount = formatCurrency(bondLockedBtc(position), { preset: 'pad-decimals' });
  const next = position.nextPeriod;
  const window = next
    ? `between ${formatEstimatedDate(next.registrationOpensBurnHeight, ctx)} and ${formatEstimatedDate(next.registrationClosesBurnHeight, ctx)}`
    : 'in the next registration window';

  if (variant === 'unlocked') {
    return {
      title: 'Your bond has unlocked',
      body: `${amount} came back to you on ${formatEstimatedDate(position.unlockBurnHeight, ctx)} and is spendable now.${
        next
          ? ` ${formatPeriodName(next)} is open until ${formatEstimatedDate(next.registrationClosesBurnHeight, ctx)} if you want to go again.`
          : ''
      }`,
      primaryActionLabel: 'Bond again',
    };
  }

  const days = daysUntil(position.unlockBurnHeight, ctx);
  return {
    title: `Your bond unlocks in ${days} ${days === 1 ? 'day' : 'days'}`,
    body: `Bitcoin does not re-lock itself. To stay in for the next period, sign a new timelock ${window} in Bitcoin Staking.`,
    primaryActionLabel: 'Sign a new timelock',
  };
}

const dismissedCalloutStorageKey = 'leather-bond-callout-dismissed';

function readDismissedCallout() {
  try {
    return localStorage.getItem(dismissedCalloutStorageKey);
  } catch {
    return null;
  }
}

function persistDismissedCallout(key: string) {
  try {
    localStorage.setItem(dismissedCalloutStorageKey, key);
  } catch {
    // storage unavailable, dismissal lasts for the session only
  }
}

export function BondCallout() {
  const bond = useBondPosition();
  const [dismissedKey, setDismissedKey] = useState(readDismissedCallout);

  if (bond.state !== 'success') return null;

  const ctx = bond.value;
  const position = ctx.position;
  if (!position) return null;

  const variant = getBondCalloutVariant(ctx);
  if (!variant) return null;

  // One dismissal per bond and state, so the "unlocked" notice still shows after
  // "unlocks soon" was dismissed.
  const dismissalKey = `${position.bondIndex}:${variant}`;
  if (dismissedKey === dismissalKey) return null;

  const copy = getBondCalloutCopy(variant, position, ctx);

  return (
    <BondCalloutLayout
      variant={variant}
      title={copy.title}
      body={copy.body}
      primaryActionLabel={copy.primaryActionLabel}
      onPrimaryAction={() => openInNewTab(bitcoinStakingUrl)}
      onDismiss={() => {
        persistDismissedCallout(dismissalKey);
        setDismissedKey(dismissalKey);
      }}
    />
  );
}
