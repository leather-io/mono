import type { P2Ret } from '@scure/btc-signer/payment';
import BigNumber from 'bignumber.js';
import { DEFAULT_MAX_SIGNER_FEE } from 'sbtc';

import { BitcoinSigner } from '@leather.io/bitcoin';
import type { OwnedUtxo } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { Outlet } from '@app/routes/compat';

import { SwapForm } from '../form/swap-form';
import { useAllSwappableAssets } from '../hooks/use-all-swappable-assets';
import { type SbtcDeposit } from '../hooks/use-sbtc-deposit-transaction';
import { SwapProvider } from '../swap-provider';
import type { BaseSwapContext } from '../swap.context';
import { useBitcoinSwap } from './use-bitcoin-swap';

export interface BitcoinSwapContext extends BaseSwapContext<BitcoinSwapContext> {
  deposit?: SbtcDeposit;
  maxSignerFee: number;
  signer: BitcoinSigner<P2Ret>;
  utxos: OwnedUtxo[];
}

interface BitcoinSwapProviderProps {
  signer: BitcoinSigner<P2Ret>;
  utxos: OwnedUtxo[];
}
export function BitcoinSwapProvider({ signer, utxos }: BitcoinSwapProviderProps) {
  const { allSwappableAssets, bitcoinSwappableAssetsQuote } = useAllSwappableAssets();
  const { fetchQuoteAmount, onSubmitSwapForReview, onSubmitSwap } = useBitcoinSwap(signer, utxos);

  return (
    <SwapProvider<BitcoinSwapContext>
      initialData={{
        chain: 'bitcoin',
        fee: createMoney(new BigNumber(0), 'BTC'),
        maxSignerFee: DEFAULT_MAX_SIGNER_FEE,
        protocol: 'sBTC Protocol',
        signer,
        swappableAssetsBase: allSwappableAssets,
        swappableAssetsQuote: bitcoinSwappableAssetsQuote,
        timestamp: new Date().toISOString(),
        utxos,
        fetchQuoteAmount,
        onSubmitSwapForReview,
        onSubmitSwap,
      }}
    >
      <SwapForm>
        <Outlet />
      </SwapForm>
    </SwapProvider>
  );
}
