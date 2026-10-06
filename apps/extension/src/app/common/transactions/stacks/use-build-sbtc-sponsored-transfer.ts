import { useCallback } from 'react';

import { PostConditionMode, type StacksTransactionWire, serializeCV } from '@stacks/transactions';

import type { SbtcSponsorshipFeeTier } from '@leather.io/services';
import {
  type SbtcSponsoredTransferParams,
  TransactionTypes,
  buildSbtcSponsoredTransferPostCondition,
  buildSbtcTransferManyArgs,
  getStacksAssetStringParts,
  sbtcTransferManyFunctionName,
} from '@leather.io/stacks';

import type { StacksSendFormValues } from '@shared/models/form.model';

import { ftUnshiftDecimals } from '@app/common/stacks-utils';
import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { useFetchSbtcSponsorshipQuote } from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import { generateUnsignedTransaction } from './generate-unsigned-txs';

export interface SbtcSponsoredTransfer {
  tx: StacksTransactionWire;
  sponsorship: SbtcSponsorshipRouteState;
}

interface UseBuildSbtcSponsoredTransferArgs {
  assetId: string;
  decimals: number;
}

interface BuildSbtcSponsoredTransferArgs {
  formValues: StacksSendFormValues;
  feeTier: SbtcSponsorshipFeeTier;
  fresh?: boolean;
}

export function useBuildSbtcSponsoredTransfer({
  assetId,
  decimals,
}: UseBuildSbtcSponsoredTransferArgs) {
  const fetchSbtcSponsorshipQuote = useFetchSbtcSponsorshipQuote();
  const account = useCurrentStacksAccount();
  const network = useCurrentStacksNetworkState();
  const { contractAddress, contractName } = getStacksAssetStringParts(assetId);

  return useCallback(
    async ({
      formValues,
      feeTier,
      fresh = false,
    }: BuildSbtcSponsoredTransferArgs): Promise<SbtcSponsoredTransfer> => {
      if (!account) throw new Error('No Stacks account selected');
      const { quote, nonce } = await fetchSbtcSponsorshipQuote({ fresh });
      const tier = quote.tiers[feeTier];
      const values = fresh ? { ...formValues, nonce } : formValues;
      const hasExplicitNonce = values.nonce !== undefined && values.nonce !== '';

      const params: SbtcSponsoredTransferParams = {
        contractAddress,
        contractName,
        sender: account.address,
        recipient: values.recipient,
        feeRecipient: quote.feeRecipientPrincipal,
        amount: BigInt(ftUnshiftDecimals(values.amount, decimals)),
        feeAmount: BigInt(tier.feeSats),
        memo: values.memo !== '' ? values.memo : undefined,
      };

      const tx = await generateUnsignedTransaction({
        txData: {
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
        },
        fee: 0,
        publicKey: account.stxPublicKey,
        nonce: hasExplicitNonce ? Number(values.nonce) : nonce,
      });

      return {
        tx,
        sponsorship: {
          quoteId: tier.quoteId,
          feeTier,
          expiresAt: quote.expiresAt,
          assetId,
          formValues: values,
        },
      };
    },
    [account, assetId, contractAddress, contractName, decimals, fetchSbtcSponsorshipQuote, network]
  );
}
