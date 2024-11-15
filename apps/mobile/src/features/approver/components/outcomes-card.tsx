import { BitcoinTokenBalance } from '@/features/balances/bitcoin/bitcoin-balance';
import { useWalletTotalBitcoinBalance } from '@/queries/balance/bitcoin-balance.query';
import { t } from '@lingui/macro';

import { AddressDisplayer, Avatar, Box, Flag, Text, UsersTwoIcon } from '@leather.io/ui/native';

export function OutcomesCard() {
  const { availableBalance, fiatBalance } = useWalletTotalBitcoinBalance();
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title1',
          message: "You'll send",
        })}
      </Text>
      <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />

      <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title2',
          message: 'To address',
        })}
      </Text>
      <Flag
        img={
          <Avatar bg="ink.background-secondary">
            <UsersTwoIcon />
          </Avatar>
        }
      >
        <AddressDisplayer address="bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e" />
      </Flag>
    </>
  );
}
