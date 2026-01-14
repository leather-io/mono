import { USDCX_ASSET_ID_MAINNET, USDCX_ASSET_ID_TESTNET } from '@leather.io/constants';
import type { Sip10Balance } from '@leather.io/services';
import { isSameAsset } from '@leather.io/utils';

import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import {
  useGetSip10AccountBalanceQuery,
  useGetSip10AddressBalanceQuery,
  useGetSip10BalanceByAssetIdQuery,
} from './sip10-balance.query';

export function useUsdcxAccountBalance(accountIndex: number) {
  const account = useAccountAddresses(accountIndex);
  const network = useCurrentNetwork();
  return toFetchState(
    useGetSip10BalanceByAssetIdQuery(
      {
        account,
      },
      network.chain.bitcoin.mode === 'mainnet' ? USDCX_ASSET_ID_MAINNET : USDCX_ASSET_ID_TESTNET
    )
  );
}

export function useSip10AddressTransferableTokenBalances(address: string) {
  const balance = useSip10AddressBalance(address);
  if (balance.state !== 'success') {
    return {
      isLoading: true,
      sip10s: [],
    };
  }
  return {
    isLoading: false,
    sip10s: balance.value.sip10s.filter(
      t => t.crypto.availableBalance.amount.isGreaterThan(0) && t.asset.canTransfer
    ),
  };
}

export function useManagedSip10Tools(accountIndex: number) {
  const enabledSip10s = useSip10AccountBalance(accountIndex);

  return {
    isEnabled: (token: Sip10Balance) =>
      !!enabledSip10s.value?.sip10s.find(sip10 => isSameAsset(sip10.asset, token.asset)),
  };
}

function useSip10AddressBalance(address: string) {
  return toFetchState(useGetSip10AddressBalanceQuery(address));
}

export function useSip10AccountBalance(
  accountIndex: number,
  options?: { includeHiddenAssets?: boolean }
) {
  const account = useAccountAddresses(accountIndex);
  return toFetchState(
    useGetSip10AccountBalanceQuery({
      account,
      assets: { includeHiddenAssets: options?.includeHiddenAssets },
    })
  );
}
