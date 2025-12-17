import type { Sip10Balance } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { StacksAssetAvatar } from '@app/components/stacks-asset-avatar';
import { useSip10AccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

const USDCX_CONTRACT_ID_MAINNET = 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token';
const USDCX_CONTRACT_ID_TESTNET = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx::usdcx-token';

interface UsdcxAssetItemBalanceLoaderProps {
  accountIndex: number;
  children(balance: Sip10Balance, isLoading: boolean): React.ReactNode;
}

export function UsdcxAssetItemBalanceLoader({
  accountIndex,
  children,
}: UsdcxAssetItemBalanceLoaderProps) {
  const sip10Balance = useSip10AccountBalance(accountIndex, {
    includeHiddenAssets: true,
  });

  const isLoading = sip10Balance.state === 'loading';

  if (isLoading) return <CryptoAssetItemPlaceholder />;

  if (sip10Balance.state === 'error') {
    return (
      <CryptoAssetItemError
        caption="USDCx"
        icon={
          <StacksAssetAvatar color="white" gradientString={USDCX_CONTRACT_ID_MAINNET}>
            U
          </StacksAssetAvatar>
        }
        title="USDCx"
      />
    );
  }

  const usdcxBalance = sip10Balance.value.sip10s.find(
    token =>
      token.asset.assetId === USDCX_CONTRACT_ID_MAINNET ||
      token.asset.assetId === USDCX_CONTRACT_ID_TESTNET
  );

  const zeroBalance = {
    asset: {
      chain: 'stacks',
      category: 'fungible',
      protocol: 'sip10',
      canTransfer: true,
      assetId: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token',
      contractId: 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://ipfs.io/ipfs/bafkreiev6flgstwgefqpaieahshidfhz4czgbvryxbtusqzwarmp4mmkfu',
      name: 'USDCx',
      symbol: 'USDCx',
    },
    quote: {
      totalBalance: createMoney(0, 'USDCx', 2),
      inboundBalance: createMoney(0, 'USDCx', 2),
      outboundBalance: createMoney(0, 'USDCx', 2),
      pendingBalance: createMoney(0, 'USDCx', 2),
      availableBalance: createMoney(0, 'USDCx', 2),
      amount: createMoney(0, 'USDCx', 2),
    },
    crypto: {
      totalBalance: createMoney(0, 'USDCx', 2),
      inboundBalance: createMoney(0, 'USDCx', 2),
      outboundBalance: createMoney(0, 'USDCx', 2),
      pendingBalance: createMoney(0, 'USDCx', 2),
      availableBalance: createMoney(0, 'USDCx', 2),
    },
  } as const;

  if (!usdcxBalance) return children(zeroBalance, isLoading);

  return children(usdcxBalance, isLoading);
}
