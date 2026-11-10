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
import { createMoney, unitToFractionalUnit } from '@leather.io/utils';

import type { StacksSendFormValues } from '@shared/models/form.model';

import type { SbtcSponsorshipRouteState } from '@app/pages/send/send-crypto-asset-form/hooks/use-send-form-navigate';
import { useFetchSbtcSponsorshipQuote } from '@app/query/sbtc/sbtc-sponsorship.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';

import { getSbtcSponsorshipFeeSats } from './sbtc-sponsorship.utils';

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
  stxFeeMicro: number;
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
      stxFeeMicro,
      fresh = false,
    }: BuildSbtcSponsoredTransferArgs): Promise<SbtcSponsoredTransfer> => {
      if (!account) throw new Error('No Stacks account selected');
      const { quote, nonce } = await fetchSbtcSponsorshipQuote({ fresh });
      const values = fresh ? { ...formValues, nonce } : formValues;
      const hasExplicitNonce = values.nonce !== undefined && values.nonce !== '';

      const params: SbtcSponsoredTransferParams = {
        contractAddress,
        contractName,
        sender: account.address,
        recipient: values.recipient,
        feeRecipient: quote.feeRecipientPrincipal,
        amount: BigInt(unitToFractionalUnit(decimals)(values.amount).toString(10)),
        feeAmount: BigInt(getSbtcSponsorshipFeeSats(stxFeeMicro, quote)),
        memo: values.memo !== '' ? values.memo : undefined,
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
        nonce: hasExplicitNonce ? Number(values.nonce) : nonce,
      });

      return {
        tx,
        sponsorship: {
          quoteId: quote.quoteId,
          stxFeeMicro,
          expiresAt: quote.expiresAt,
          assetId,
          formValues: values,
        },
      };
    },
    [account, assetId, contractAddress, contractName, decimals, fetchSbtcSponsorshipQuote, network]
  );
}
