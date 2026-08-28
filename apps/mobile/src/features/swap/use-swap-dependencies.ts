import { signTx } from '@/features/psbt-signer/signer';
import { useAccountRequest } from '@/hooks/use-account-request';
import { useBitcoinClient } from '@/queries/clients/bitcoin-client';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { broadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { isSecureStoreUserCancelledError } from '@/store/secure-store/secure-store-errors';
import { useNetworkPreferenceStacksNetwork, useSettings } from '@/store/settings/settings';

import {
  getBitcoinCoinSelectionService,
  getBitcoinTransactionFeesService,
  getMarketDataService,
  getStacksTransactionFeesService,
  getSwapService,
} from '@leather.io/services';
import { SwapDependencies, broadcastBitcoinTransaction } from '@leather.io/state/swap';
import { assertExistence } from '@leather.io/utils';

export function useSwapDependencies(): SwapDependencies {
  const accountRequest = useAccountRequest();
  const { fingerprint, accountIndex } = accountRequest.account.id;
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const { networkPreference } = useSettings();
  const { fromAccountIndex } = useStacksSigners();
  const stacksSigner = fromAccountIndex(fingerprint, accountIndex)[0];
  const bitcoinAccounts = useBitcoinAccounts();
  const { nativeSegwit } = bitcoinAccounts.accountIndexByPaymentType(fingerprint, accountIndex);
  const bitcoinPayer = nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 });
  const bitcoinClient = useBitcoinClient();
  const { data: nextNonce } = useNextNonce(stacksSigner?.address ?? '');

  assertExistence(stacksSigner, 'Stacks signer missing during swap initialization');
  assertExistence(bitcoinPayer, 'Bitcoin payer missing during swap initialization.');

  return {
    accountRequest,
    services: {
      stacksTransactionFeesService: getStacksTransactionFeesService(),
      marketDataService: getMarketDataService(),
      bitcoinTransactionFeesService: getBitcoinTransactionFeesService(),
      bitcoinCoinSelectionService: getBitcoinCoinSelectionService(),
      swapService: getSwapService(),
    },
    stacks: {
      stacksNetwork,
      stacksSigner,
      broadcast: broadcastStacksTransaction,
      nextNonce,
    },
    bitcoin: {
      network: networkPreference,
      bitcoinPayer,
      signBitcoinPsbt: signTx,
      broadcast: (txHex: string) => broadcastBitcoinTransaction(bitcoinClient, txHex),
    },
    isSigningCancelledError: isSecureStoreUserCancelledError,
  };
}
