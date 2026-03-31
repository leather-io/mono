import type { DistributedOmit } from 'type-fest';

import { BitcoinNativeSegwitPayer } from '@leather.io/bitcoin';
import type { AccountId } from '@leather.io/models';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

interface BitcoinAccountLoaderBaseProps {
  children(account: BitcoinNativeSegwitPayer): React.ReactNode;
  fallback?: React.ReactNode;
}
interface BtcAccountLoaderCurrentProps extends BitcoinAccountLoaderBaseProps {
  current: true;
}
interface BtcAccountLoaderIndexProps extends BitcoinAccountLoaderBaseProps {
  accountId: AccountId;
}

type BtcAccountLoaderProps = BtcAccountLoaderCurrentProps | BtcAccountLoaderIndexProps;

export function useBitcoinNativeSegwitAccountLoader(
  props: DistributedOmit<BtcAccountLoaderProps, 'children' | 'fallback'>
) {
  const hasBitcoinKeys = useHasCurrentBitcoinAccount();
  const currentAccount = useCurrentAccountId();
  const properIndex = 'current' in props ? currentAccount : props.accountId;

  const payerFactory = useNativeSegwitPayer(properIndex);

  if (!payerFactory || !hasBitcoinKeys) return null;
  return payerFactory({ changeIndex: 0, addressIndex: 0 });
}

export function BitcoinNativeSegwitAccountLoader({
  children,
  fallback,
  ...props
}: BtcAccountLoaderProps) {
  const account = useBitcoinNativeSegwitAccountLoader(props);
  if (!account) return fallback;
  return children(account);
}
