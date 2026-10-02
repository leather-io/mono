import { ReactNode } from 'react';

import BigNumber from 'bignumber.js';
import { Box, styled } from 'leather-styles/jsx';
import { link as linkRecipe } from 'leather-styles/recipes';
import { BasicHoverCard } from '~/components/basic-hover-card';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { STAKING_TX_FEE_RESERVE_USTX } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { InfoCircleIcon, Spinner } from '@leather.io/ui';
import { microStxToStx } from '@leather.io/utils';

import { StakingConnectAction } from '../hooks/use-staking-connect-action';

const feeReserveExplanation = `${microStxToStx(STAKING_TX_FEE_RESERVE_USTX)} STX reserved for transaction fees`;

function maxStakeableAmount(availableAmount: BigNumber) {
  return BigNumber.max(availableAmount.minus(STAKING_TX_FEE_RESERVE_USTX), 0);
}

interface BalanceRowLinkProps {
  children: ReactNode;
  onClick(): void;
}

function BalanceRowLink({ children, onClick }: BalanceRowLinkProps) {
  return (
    <styled.button
      type="button"
      className={linkRecipe({ variant: 'underlined' })}
      bg="transparent"
      border="none"
      p="0"
      ml="space.02"
      color="ink.text-primary"
      cursor="pointer"
      onClick={onClick}
    >
      {children}
    </styled.button>
  );
}

interface ConnectBalancePromptProps {
  connectAction: Exclude<StakingConnectAction, { status: 'connected' }>;
}

function ConnectBalancePrompt({ connectAction }: ConnectBalancePromptProps) {
  if (connectAction.status === 'pending') return <Spinner />;

  const label =
    connectAction.status === 'install'
      ? bitcoinStakingContent.connectGate.balancePrompt.install
      : bitcoinStakingContent.connectGate.balancePrompt.connect;

  return (
    <BalanceRowLink onClick={() => void connectAction.run()}>
      <styled.span data-testid="available-balance-connect">{label}</styled.span>
    </BalanceRowLink>
  );
}

interface AvailableBalanceRowProps {
  isLoading: boolean;
  availableAmount: BigNumber | undefined;
  onSelectMax(maxStakeableStx: number): void;
  connectAction?: StakingConnectAction;
}

export function AvailableBalanceRow({
  isLoading,
  availableAmount,
  onSelectMax,
  connectAction,
}: AvailableBalanceRowProps) {
  const maxAmount = availableAmount ? maxStakeableAmount(availableAmount) : undefined;

  if (connectAction && connectAction.status !== 'connected') {
    return (
      <Box
        textStyle="body.02"
        color="ink.text-subdued"
        aria-busy={connectAction.status === 'pending'}
      >
        <styled.span textStyle="caption">Available balance:</styled.span>
        <ConnectBalancePrompt connectAction={connectAction} />
      </Box>
    );
  }

  return (
    <Box textStyle="body.02" color="ink.text-subdued" aria-busy={isLoading}>
      <styled.span textStyle="caption">Available balance:</styled.span>
      {isLoading && <Spinner />}
      {!isLoading && maxAmount && (
        <>
          <BalanceRowLink onClick={() => onSelectMax(microStxToStx(maxAmount).toNumber())}>
            {toHumanReadableMicroStx(maxAmount)}
          </BalanceRowLink>
          <BasicHoverCard title="Available balance" content={feeReserveExplanation}>
            <styled.span
              display="inline-flex"
              alignItems="center"
              height="1lh"
              verticalAlign="top"
              ml="space.01"
              cursor="help"
              aria-label="About available balance"
            >
              <InfoCircleIcon variant="small" color="ink.text-subdued" />
            </styled.span>
          </BasicHoverCard>
        </>
      )}
      {!isLoading && !maxAmount && 'Failed to load'}
    </Box>
  );
}
