import { Stack } from 'leather-styles/jsx';

import { useRunesAccountBalance } from '@app/query/bitcoin/runes/runes-balance.query';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';
import { useCurrentAccountIndex } from '@app/store/accounts/account';

import { AssetsList } from './components/assets-list';
import { BitcoinBalance } from './components/bitcoin-balance';
import { StacksBalance } from './components/stacks-balance';

export function AssetBalances() {
  const accountIndex = useCurrentAccountIndex();
  const sip10Data = useSip10AccountBalance(accountIndex);
  const runesData = useRunesAccountBalance(accountIndex);

  return (
    <Stack gap="space.03" width="100%">
      <Stack gap="space.02">
        <BitcoinBalance accountIndex={accountIndex} />
        <StacksBalance accountIndex={accountIndex} />
      </Stack>
      <AssetsList sip10Data={sip10Data} runesData={runesData} />
    </Stack>
  );
}
