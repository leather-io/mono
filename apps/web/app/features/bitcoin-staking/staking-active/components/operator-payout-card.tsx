import { css } from 'leather-styles/css';
import { HStack, Stack, styled } from 'leather-styles/jsx';
import { link as linkRecipe } from 'leather-styles/recipes';
import { CopyAddress } from '~/components/copy-address';
import { EM_DASH } from '~/constants/constants';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { BitcoinStakingPool, OperatorBtcPayout } from '~/data/bitcoin-staking-data';

import { ArrowLeftIcon } from '@leather.io/ui';

interface OperatorPayoutCardProps {
  pool: BitcoinStakingPool;
  operatorPayout: OperatorBtcPayout;
  payoutAddress: string | null;
}

export function OperatorPayoutCard({
  pool,
  operatorPayout,
  payoutAddress,
}: OperatorPayoutCardProps) {
  const copy = bitcoinStakingContent.operatorPayout.activeCard;

  return (
    <Stack
      gap="space.03"
      p="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      data-testid="operator-payout-card"
    >
      <HStack justifyContent="space-between" alignItems="flex-start" gap="space.03">
        <Stack gap="space.01">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            {copy.title}
          </styled.span>
          <styled.span textStyle="heading.05">{copy.paidBy(pool.name)}</styled.span>
        </Stack>
        <styled.a
          href={pool.url}
          target="_blank"
          rel="noreferrer"
          flexShrink={0}
          className={linkRecipe({ size: 'sm' })}
          display="inline-flex"
          alignItems="center"
          gap="space.01"
          data-testid="operator-payout-link"
        >
          {copy.linkLabel(pool.name)}
          <ArrowLeftIcon variant="small" className={css({ transform: 'rotate(180deg)' })} />
        </styled.a>
      </HStack>

      <styled.div textStyle="label.02" data-testid="operator-payout-address">
        {payoutAddress ? <CopyAddress addr={payoutAddress} emphasis underlined wide /> : EM_DASH}
      </styled.div>

      <styled.p textStyle="caption.01" color="ink.text-subdued">
        {copy.description(pool.name, operatorPayout.cadence)}
      </styled.p>
    </Stack>
  );
}
