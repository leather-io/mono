import { useCallback } from 'react';

import { PostConditionMode, type StacksTransactionWire, serializeCV } from '@stacks/transactions';

import {
  type SbtcSponsoredTransferParams,
  TransactionTypes,
  buildSbtcSponsoredTransferPostCondition,
  buildSbtcTransferManyArgs,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
  sbtcTransferManyFunctionName,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { useFetchSbtcSponsorshipQuote } from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import { getSbtcSponsorshipFeeSats } from './sbtc-sponsorship.utils';

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
  const { contractAddress, contractName } = getStacksAssetStringParts(contractId);

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

      const params: SbtcSponsoredTransferParams = {
        contractAddress,
        contractName,
        sender: account.address,
        recipient,
        feeRecipient: quote.feeRecipientPrincipal,
        amount,
        feeAmount: BigInt(getSbtcSponsorshipFeeSats(stxFeeMicro, quote)),
        memo,
      };

      const tx = await generateStacksUnsignedTransaction({
        txType: TransactionTypes.ContractCall,
        contractAddress,
        contractName,
        functionName: sbtcTransferManyFunctionName,
        functionArgs: buildSbtcTransferManyArgs(params).map(arg => serializeCV(arg)),
        postConditions: [buildSbtcSponsoredTransferPostCondition(params)],
        postConditionMode: PostConditionMode.Deny,
        network,
        publicKey: account.stxPublicKey,
        sponsored: true,
        fee: createMoney(0, 'STX'),
        nonce: nonce ?? nextNonce,
      });

      return {
        tx,
        sponsorship: { quoteId: quote.quoteId, stxFeeMicro, expiresAt: quote.expiresAt },
      };
    },
    [account, contractAddress, contractName, fetchSbtcSponsorshipQuote, network]
  );
}
