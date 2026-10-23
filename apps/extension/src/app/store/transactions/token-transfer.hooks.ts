import { useCallback } from 'react';
import { useAsync } from 'react-async-hook';

import type { StacksNetwork } from '@stacks/network';
import {
  type ClarityValue,
  PostConditionMode,
  bufferCVFromString,
  contractPrincipalCV,
  createEmptyAddress,
  fetchNonce,
  getAddressFromPublicKey,
  noneCV,
  serializeCV,
  someCV,
  standardPrincipalCV,
  standardPrincipalCVFromAddress,
  uintCV,
} from '@stacks/transactions';

import type { Sip10Asset } from '@leather.io/models';
import {
  TransactionTypes,
  generateStacksUnsignedTransaction,
  getStacksAssetStringParts,
  inferPrincipalTypeFromAddress,
} from '@leather.io/stacks';
import { createMoney, stxToMicroStx, unitToFractionalUnit } from '@leather.io/utils';

import { logger } from '@shared/logger';
import type { StacksSendFormValues, StacksTransactionFormValues } from '@shared/models/form.model';
import { makeFtPostCondition } from '@shared/utils/post-conditions';

import {
  buildUnsignedPolicySip10Transfer,
  buildUnsignedPolicyStxTransfer,
} from '@app/features/multisig/build-policy-stacks-transfer';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import {
  useCurrentStacksAccount,
  useCurrentStacksAccountAddress,
} from '../accounts/blockchain/stacks/stacks-account.hooks';

function createPrincipalCV(principal: string) {
  const principalType = inferPrincipalTypeFromAddress(principal);

  if (principalType === 'contract') {
    const [address, contractName] = principal.split('.');
    return contractPrincipalCV(address, contractName);
  }

  if (principalType === 'standard') return standardPrincipalCV(principal);

  throw new Error(`Invalid principal: ${principal}`);
}

interface GenerateWithResolvedNonceArgs {
  nonce?: number;
  publicKey: string;
  network: StacksNetwork;
}

async function generateWithResolvedNonce<T>(
  { nonce, publicKey, network }: GenerateWithResolvedNonceArgs,
  generate: (nonce: number | string) => Promise<T>
) {
  if (nonce !== undefined) return generate(nonce);
  const fetchedNonce = await fetchNonce({
    address: getAddressFromPublicKey(publicKey, network),
    network,
  });
  return generate(fetchedNonce.toString());
}

function formValueToStxMoney(value: number | string | undefined) {
  if (!value) return undefined;
  return createMoney(stxToMicroStx(value), 'STX');
}

export function useGenerateStxTokenTransferUnsignedTx() {
  const account = useCurrentStacksAccount();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const network = useCurrentStacksNetworkState();
  const policy = useCurrentPolicy();

  return useCallback(
    async (values?: StacksSendFormValues) => {
      if (!account) return;

      if (policy?.chain === 'stacks') {
        if (!policy.publicKeys.includes(account.stxPublicKey)) {
          logger.error('Current account is not a signer of this multisig policy');
          return;
        }
        return buildUnsignedPolicyStxTransfer({
          policy,
          network,
          recipient: values?.recipient || policy.address,
          amount: formValueToStxMoney(values?.amount),
          fee: formValueToStxMoney(values?.fee),
          memo: values?.memo || undefined,
        });
      }

      return generateWithResolvedNonce(
        {
          nonce: values?.nonce ? Number(values.nonce) : nextNonce?.nonce,
          publicKey: account.stxPublicKey,
          network,
        },
        nonce =>
          generateStacksUnsignedTransaction({
            txType: TransactionTypes.StxTokenTransfer,
            publicKey: account.stxPublicKey,
            nonce,
            fee: formValueToStxMoney(values?.fee) ?? createMoney(0, 'STX'),
            // Using account address here as a fallback for a fee estimation
            recipient: values?.recipient ?? account.address,
            amount: createMoney(values?.amount ? stxToMicroStx(values?.amount) : 0, 'STX'),
            memo: values?.memo || undefined,
            network,
            // Coercing type here as we don't have the public key
            // as expected by STXTransferPayload type.
            // This code will likely need to change soon with Ledger
            // work, and coercion allows us to remove lots of type mangling
            // and types are out of sync with @stacks/connect
          })
      );
    },
    [account, nextNonce, network, policy]
  );
}

export function useStxTokenTransferUnsignedTxState(values?: StacksSendFormValues) {
  const generateTx = useGenerateStxTokenTransferUnsignedTx();
  const account = useCurrentStacksAccount();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const network = useCurrentStacksNetworkState();
  const policy = useCurrentPolicy();

  const tx = useAsync(
    async () => generateTx(values ?? undefined),
    [values, network, account, nextNonce, policy]
  );

  return tx.result;
}

export function useGenerateFtTokenTransferUnsignedTx(info: Sip10Asset) {
  const account = useCurrentStacksAccount();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const network = useCurrentStacksNetworkState();
  const policy = useCurrentPolicy();
  const { assetId } = info;
  const { contractAddress, contractAssetName, contractName } = getStacksAssetStringParts(assetId);
  return useCallback(
    async (values?: StacksSendFormValues | StacksTransactionFormValues) => {
      try {
        if (!account) return;

        if (policy?.chain === 'stacks') {
          if (!policy.publicKeys.includes(account.stxPublicKey)) {
            logger.error('Current account is not a signer of this multisig policy');
            return;
          }
          const amountInBaseUnits =
            values && 'amount' in values && values.amount
              ? unitToFractionalUnit(info.decimals)(values.amount).toString(10)
              : undefined;
          return await buildUnsignedPolicySip10Transfer({
            policy,
            network,
            assetId,
            recipient:
              values && 'recipient' in values && values.recipient
                ? values.recipient
                : policy.address,
            baseUnitAmount: amountInBaseUnits,
            fee: formValueToStxMoney(values?.fee),
            memo: values && 'memo' in values && values.memo !== '' ? values.memo : undefined,
          });
        }

        const functionName = 'transfer';
        const recipientAddressClarityValue =
          values && 'recipient' in values
            ? createPrincipalCV(values.recipient)
            : standardPrincipalCVFromAddress(createEmptyAddress());
        const amount = values && 'amount' in values ? values.amount : 0;
        const memo =
          values && 'memo' in values && values.memo
            ? someCV(bufferCVFromString(values.memo))
            : noneCV();

        const amountAsFractionalUnit = unitToFractionalUnit(info.decimals)(amount).toString(10);
        const postConditionOptions = {
          amount: amountAsFractionalUnit,
          contractAddress,
          contractAssetName,
          contractName,
          stxAddress: account.address,
        };

        const postConditions = [makeFtPostCondition(postConditionOptions)];

        // (transfer (uint principal principal) (response bool uint))
        const functionArgs: ClarityValue[] = [
          uintCV(amountAsFractionalUnit),
          createPrincipalCV(account.address),
          recipientAddressClarityValue,
        ];

        functionArgs.push(memo);

        return generateWithResolvedNonce(
          {
            nonce: values?.nonce ? Number(values.nonce) : nextNonce?.nonce,
            publicKey: account.stxPublicKey,
            network,
          },
          nonce =>
            generateStacksUnsignedTransaction({
              txType: TransactionTypes.ContractCall,
              contractAddress,
              contractName,
              functionName,
              functionArgs: functionArgs.map(arg => serializeCV(arg)),
              postConditions,
              postConditionMode: PostConditionMode.Deny,
              network,
              publicKey: account.stxPublicKey,
              fee: formValueToStxMoney(values?.fee) ?? createMoney(0, 'STX'),
              nonce,
            })
        );
      } catch (error) {
        logger.error('Failed to generate unsigned transaction', error);
        return;
      }
    },
    [
      account,
      info.decimals,
      network,
      nextNonce?.nonce,
      contractName,
      contractAssetName,
      contractAddress,
      policy,
      assetId,
    ]
  );
}

export function useFtTokenTransferUnsignedTx(info: Sip10Asset) {
  const account = useCurrentStacksAccount();
  const generateTx = useGenerateFtTokenTransferUnsignedTx(info);

  const tx = useAsync(async () => generateTx(), [account, generateTx]);
  return tx.result;
}
