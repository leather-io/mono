import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { type BitcoinStakingPool, getStakingPoolFromSlug } from '~/data/bitcoin-staking-data';

import { useStakingAcknowledgment } from '../../hooks/use-staking-acknowledgment';
import { StakingConfirmationSteps } from './staking-confirmation-steps';

interface ConfirmationHarnessProps {
  pool?: BitcoinStakingPool | null;
  onConfirm(): void;
  isBusy?: boolean;
}

function ConfirmationHarness({ pool = null, onConfirm, isBusy }: ConfirmationHarnessProps) {
  const acknowledgment = useStakingAcknowledgment('fast-pool:3200:12');
  return (
    <StakingConfirmationSteps
      pool={pool}
      stakeAmount={3200}
      cycles={12}
      estimatedUnlockDate={new Date('2027-03-25T12:00:00Z')}
      acknowledgment={acknowledgment}
      onConfirm={onConfirm}
      isBusy={isBusy}
    />
  );
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe(StakingConfirmationSteps.name, () => {
  test('requires explicit acknowledgment, keeps the terms link independent, and supports unchecking', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationHarness onConfirm={onConfirm} />);
    const confirm = screen.getByRole('button', { name: 'Confirm and start staking' });
    const checkbox = screen.getByRole('checkbox');
    expect(confirm.hasAttribute('disabled')).toBe(false);
    expect(checkbox).toHaveProperty('checked', false);
    expect(checkbox.hasAttribute('aria-invalid')).toBe(false);
    const link = screen.getByRole('link', { name: 'Leather terms (opens in a new tab)' });
    expect(link.getAttribute('href')).toBe('https://leather.io/terms');
    expect(link.getAttribute('target')).toBe('_blank');
    fireEvent.click(link);
    expect(checkbox).toHaveProperty('checked', false);
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe(
      bitcoinStakingContent.acknowledgment.requiredMessage
    );
    fireEvent.click(screen.getByText(bitcoinStakingContent.acknowledgment.label));
    expect(checkbox).toHaveProperty('checked', true);
    expect(checkbox.hasAttribute('aria-invalid')).toBe(false);
    expect(screen.getByRole('alert').textContent).toBe('');
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(checkbox);
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('prevents changes and duplicate confirmation during submission', () => {
    const onConfirm = vi.fn();
    render(<ConfirmationHarness onConfirm={onConfirm} isBusy />);
    expect(screen.getByRole('checkbox').hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and start staking' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test.each([
    { pool: getStakingPoolFromSlug('fast-pool'), text: /claimed through Fast Pool's contract/ },
    { pool: getStakingPoolFromSlug('stacking-dao'), text: /You must claim your sBTC rewards/ },
    { pool: getStakingPoolFromSlug('planbetter'), text: /rely on the operator/ },
    { pool: null, text: /custom signer-manager contract/ },
  ])('explains the payout arrangement for $pool.name', ({ pool, text }) => {
    render(<ConfirmationHarness pool={pool} onConfirm={vi.fn()} />);
    expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByText(/read and accepted.*terms/)).toBeNull();
  });
});
