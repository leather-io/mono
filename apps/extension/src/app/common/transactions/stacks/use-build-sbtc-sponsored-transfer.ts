import { useCallback } from 'react';

import type { StacksTransactionWire } from '@stacks/transactions';

import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { useFetchSbtcSponsorshipQuote } from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import {
  generateSbtcSponsoredTransferTx,
  getSbtcSponsorshipFeeSats,
} from './sbtc-sponsorship.utils';

export interface SbtcSponsoredTransfer {
  tx: StacksTransactionWire;
  sponsorship: SbtcSponsorshipRouteState;
}

interface BuildSbtcSponsoredTransferArgs {
  recipient: string;
  amount: bigint;
  memo?: string;
  nonce?: number;
  stxFeeMicro: number;
  fresh?: boolean;
}

export function useBuildSbtcSponsoredTransfer(contractId: string) {
  const fetchSbtcSponsorshipQuote = useFetchSbtcSponsorshipQuote();
  const account = useCurrentStacksAccount();
  const network = useCurrentStacksNetworkState();

  return useCallback(
    async ({
      recipient,
      amount,
      memo,
      nonce,
      stxFeeMicro,
      fresh = false,
    }: BuildSbtcSponsoredTransferArgs): Promise<SbtcSponsoredTransfer> => {
      if (!account) throw new Error('No Stacks account selected');
      const { quote, nonce: nextNonce } = await fetchSbtcSponsorshipQuote({ fresh });

      const tx = await generateSbtcSponsoredTransferTx({
        contractId,
        sender: account.address,
        publicKey: account.stxPublicKey,
        network,
        recipient,
        feeRecipient: quote.feeRecipientPrincipal,
        amount,
        feeAmount: BigInt(getSbtcSponsorshipFeeSats(stxFeeMicro, quote)),
        memo,
        nonce: nonce ?? nextNonce,
      });

      return {
        tx,
        sponsorship: { quoteId: quote.quoteId, stxFeeMicro, expiresAt: quote.expiresAt },
      };
    },
    [account, contractId, fetchSbtcSponsorshipQuote, network]
  );
}
