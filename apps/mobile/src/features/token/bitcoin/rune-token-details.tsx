import { AssetType } from '@/features/receive/get-assets';
import { useBtcAccountTaprootBalance } from '@/queries/balance/btc-balance.query';
import { useRuneBalanceByRuneName } from '@/queries/balance/runes-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { t } from '@lingui/core/macro';

import { RunesAvatarIcon } from '@leather.io/ui/native';

import { AddressList, AddressListItem } from '../components/address-list';
import { TokenLoading } from '../components/token-loading';
import { Token } from '../token';

interface RuneTokenDetailsProps {
  account: Account;
  assetId: string;
}
export function RuneTokenDetails({ assetId, account }: RuneTokenDetailsProps) {
  const { fingerprint, accountIndex } = account;
  const balance = useRuneBalanceByRuneName(fingerprint, accountIndex, assetId);
  const { taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const btcTaprootBalance = useBtcAccountTaprootBalance(account.fingerprint, account.accountIndex);

  if (balance.state === 'loading' || !balance.value) {
    return <TokenLoading />;
  }
  const { asset } = balance.value;

  return (
    <Token
      icon={<RunesAvatarIcon />}
      asset={asset}
      balance={balance}
      activity={{ state: 'success', value: [] }}
      title={asset.spacedRuneName}
      name={`${asset.spacedRuneName} ${asset.symbol}`}
      layer={t`Layer 1 · Bitcoin`}
      canSend={false}
    >
      <AddressList account={account}>
        <AddressListItem
          address={taprootPayerAddress}
          assetType={AssetType.Taproot}
          name={t`Taproot`}
          availableBalance={btcTaprootBalance.value?.btc.availableBalance}
          quoteBalance={btcTaprootBalance.value?.quote.availableBalance}
        />
      </AddressList>
    </Token>
  );
}
