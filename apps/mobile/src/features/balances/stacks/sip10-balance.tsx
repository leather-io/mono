import { FetchState, FetchWrapper } from '@/components/loading';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';

import { Money } from '@leather.io/models';
import { Sip10AddressBalance, Sip10AggregateBalance } from '@leather.io/services';
import { Sip10AvatarIcon } from '@leather.io/ui/native';

import { HardCap } from '../balances';
import { TokenBalance } from '../token-balance';

interface Sip10TokenBalanceProps {
  availableBalance?: Money;
  contractId: string;
  fiatBalance?: Money;
  imageCanonicalUri: string;
  name: string;
  symbol: string;
}
function Sip10TokenBalance({
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

function Sip10TokenBalanceError() {
  return (
    <TokenBalance
      ticker=""
      icon={<Sip10AvatarIcon contractId="" imageCanonicalUri="" name="" />}
      tokenName=""
      protocol="sip10"
      fiatBalance={undefined}
      availableBalance={undefined}
    />
  );
}

interface Sip10BalanceWrapperProps {
  data: FetchState<Sip10AggregateBalance | Sip10AddressBalance>;
  hardCap?: boolean;
}
function Sip10BalanceWrapper({ data, hardCap }: Sip10BalanceWrapperProps) {
  return (
    <FetchWrapper data={data} error={<Sip10TokenBalanceError />}>
      {data.state === 'success' &&
        data.value.sip10s.slice(0, hardCap ? 2 : undefined).map((balance, index) => {
          return (
            <Sip10TokenBalance
              key={`${balance.asset.symbol}-${index}`}
              availableBalance={balance.crypto.availableBalance}
              contractId={balance.asset.contractId}
              fiatBalance={balance.fiat.totalBalance}
              imageCanonicalUri={balance.asset.imageCanonicalUri}
              name={balance.asset.name}
              symbol={balance.asset.symbol}
            />
          );
        })}
    </FetchWrapper>
  );
}

export function Sip10Balance({ hardCap }: HardCap) {
  const data = useSip10TotalBalance();

  return <Sip10BalanceWrapper data={data} hardCap={hardCap} />;
}

interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({
  hardCap,
  accountIndex,
  fingerprint,
}: Sip10BalanceByAccountProps & HardCap) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);

  return <Sip10BalanceWrapper data={data} hardCap={hardCap} />;
}
