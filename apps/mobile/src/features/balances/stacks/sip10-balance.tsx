import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';

import { Money } from '@leather.io/models';
import { Avatar, PressableProps, StacksAssetAvatar, Text } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

const sip10MaxDisplay = 3;
interface Sip10TokenBalanceProps extends PressableProps {
  availableBalance: Money;
  contractId: string;
  fiatBalance: Money;
  symbol: string;
  name: string;
  iconSrc?: string;
}
export function Sip10TokenBalance({
  availableBalance,
  contractId,
  fiatBalance,
  name,
  symbol,
  iconSrc,
  ...rest
}: Sip10TokenBalanceProps) {
  // const icon = iconSrc ? (
  //   <Avatar image={iconSrc} />
  // ) : (
  //   <StacksAssetAvatar gradientString={contractId} img={iconSrc}>
  //     <Text>{name[0]}</Text>
  //   </StacksAssetAvatar>
  // );

  return (
    <TokenBalance
      ticker={symbol}
      icon={
        <Avatar
          image={iconSrc === '' ? 'https://avatar.vercel.sh/hfdiehfeihfifhe?size=36' : iconSrc}
          imageAlt={name}
          fallback={name[0]}
        >
          <Text>{name[0]}</Text>
        </Avatar>
      }
      tokenName={name}
      protocol="sip10"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      {...rest}
    />
  );
}
export function Sip10Balance() {
  const data = useSip10TotalBalance();

  // TODO LEA-1726: handle balance loading & error states
  if (data.state !== 'success') return;

  return data.value.sip10s.map((balance, index) => {
    if (index >= sip10MaxDisplay) return null;
    return (
      <Sip10TokenBalance
        key={`${balance.asset.symbol}-${index}`}
        symbol={balance.asset.symbol}
        name={balance.asset.name}
        iconSrc={balance.asset.imageCanonicalUri}
        contractId={balance.asset.contractId}
        availableBalance={balance.crypto.availableBalance}
        fiatBalance={balance.fiat.totalBalance}
        px="5"
        py="3"
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
    if (index >= sip10MaxDisplay) return null;
    return (
      <Sip10TokenBalance
        key={`${balance.asset.symbol}-${index}`}
        symbol={balance.asset.symbol}
        contractId={balance.asset.contractId}
        iconSrc={balance.asset.imageCanonicalUri}
        name={balance.asset.name}
        availableBalance={balance.crypto.availableBalance}
        fiatBalance={balance.fiat.totalBalance}
        px="5"
        py="3"
      />
    );
  });
}
