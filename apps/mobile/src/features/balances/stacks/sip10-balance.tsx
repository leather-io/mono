import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';

import { Money } from '@leather.io/models';
import { Sip10AvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface Sip10TokenBalanceProps {
  availableBalance: Money;
  contractId: string;
  fiatBalance: Money;
  imageCanonicalUri: string;
  name: string;
  symbol: string;
}
export function Sip10TokenBalance({
  availableBalance,
  contractId,
  fiatBalance,
  imageCanonicalUri,
  name,
  symbol,
}: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={
        <Sip10AvatarIcon
          contractId={contractId}
          imageCanonicalUri={imageCanonicalUri}
          name={name}
        />
      }
      tokenName={name}
      protocol="sip10"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
    />
  );
}
export function Sip10Balance() {
  const data = useSip10TotalBalance();

  // TODO LEA-1726: handle balance loading & error states
  if (data.state !== 'success') return;

  return data.value.sip10s.map((balance, index) => {
    return (
      <Sip10TokenBalance
        availableBalance={balance.crypto.availableBalance}
        contractId={balance.asset.contractId}
        fiatBalance={balance.fiat.totalBalance}
        imageCanonicalUri={balance.asset.imageCanonicalUri}
        key={`${balance.asset.symbol}-${index}`}
        name={balance.asset.name}
        symbol={balance.asset.symbol}
      />
    );
  });
}
interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({ accountIndex, fingerprint }: Sip10BalanceByAccountProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);

  // TODO LEA-1726: handle balance loading & error states
  if (data.state !== 'success') return;
  return data.value.sip10s.map((balance, index) => {
    return (
      <Sip10TokenBalance
        availableBalance={balance.crypto.availableBalance}
        fiatBalance={balance.fiat.totalBalance}
        contractId={balance.asset.contractId}
        key={`${balance.asset.symbol}-${index}`}
        imageCanonicalUri={balance.asset.imageCanonicalUri}
        name={balance.asset.name}
        symbol={balance.asset.symbol}
      />
    );
  });
}
