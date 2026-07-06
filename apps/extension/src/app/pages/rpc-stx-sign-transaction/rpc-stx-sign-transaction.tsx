import { useMemo } from 'react';

import {
  AuthType,
  addressToString,
  isContractCallPayload,
  isSmartContractPayload,
  isTokenTransferPayload,
  serializeCV,
} from '@stacks/transactions';

import {
  RpcErrorCode,
  createRpcErrorResponse,
  createRpcSuccessResponse,
  stxSignTransaction,
} from '@leather.io/rpc';
import { StxAvatarIcon } from '@leather.io/ui';
import { createMoney, isString } from '@leather.io/utils';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';
import { closeWindow } from '@shared/utils';

import { useConvertCryptoCurrencyToFiatAmount } from '@app/common/hooks/use-convert-to-fiat-amount';
import { AccountStacksAddress } from '@app/components/account/account-stacks-address';
import { TransactionRecipientsLayout } from '@app/components/rpc-transaction-request/transaction-recipients.layout';
import { FeeEditor } from '@app/features/fee-editor/fee-editor';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { NonceEditor } from '@app/features/nonce-editor/nonce-editor';
import { useNonceEditorContext } from '@app/features/nonce-editor/nonce-editor.context';
import { RpcTransactionRequestLayout } from '@app/features/rpc-stacks-transaction-request/rpc-transaction-request.layout';
import { SigningAccountCard } from '@app/features/rpc-stacks-transaction-request/signing-account-card/signing-account-card';
import { ContractCallDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/contract-call/contract-call-details.layout';
import { ContractDeployDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/contract-deploy/contract-deploy-details.layout';
import { PostConditionsDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/post-conditions/post-conditions-details.layout';
import { useStacksRpcTransactionRequestContext } from '@app/features/rpc-stacks-transaction-request/stacks/stacks-rpc-transaction-request.context';
import { TransactionActionsWithSpend } from '@app/features/rpc-stacks-transaction-request/transaction-actions/transaction-actions-with-spend';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';
import { useSignStacksTransaction } from '@app/store/transactions/transaction.hooks';

import {
  checkUnsignedStacksTransactionHashMode,
  getUnsignedStacksTransactionFromRpcRequest,
  isUnsignedStacksTransactionForPolicy,
} from './rpc-stx-sign-transaction.utils';

const nonMultisigPolicyTransactionMessage =
  'This transaction is not a multisig transaction for the selected account. Switch to a standard account to sign it.';
const mismatchedPolicyTransactionMessage =
  'This transaction does not match the selected multisig account. Switch accounts or request a transaction for the selected account.';

export function RpcStxSignTransaction() {
  const { address, isLoadingBalance, publicKey, requestId, tabId } =
    useStacksRpcTransactionRequestContext();
  const {
    availableBalance,
    isLoadingFees,
    isSponsored,
    marketData,
    onUserActivatesFeeEditor,
    selectedFee,
  } = useFeeEditorContext();
  const { nonce, onUserActivatesNonceEditor } = useNonceEditorContext();
  const convertToFiatAmount = useConvertCryptoCurrencyToFiatAmount('STX');
  const signStacksTx = useSignStacksTransaction();
  const policy = useCurrentPolicy();
  const network = useCurrentNetwork();

  const unsignedTxForBroadcast = useMemo(() => getUnsignedStacksTransactionFromRpcRequest(), []);

  // Handle multisig transactions
  const isMultisig = checkUnsignedStacksTransactionHashMode(unsignedTxForBroadcast);
  const canEditFeeAndNonce = !isMultisig;
  const isStacksPolicy = policy?.chain === 'stacks';
  const policyTransactionError = useMemo(() => {
    if (policy?.chain !== 'stacks') return null;
    if (!isMultisig) return nonMultisigPolicyTransactionMessage;
    if (
      isUnsignedStacksTransactionForPolicy({
        tx: unsignedTxForBroadcast,
        policy,
        signerPublicKey: publicKey,
        chainId: network.chain.stacks.chainId,
        networkId: network.id,
      })
    )
      return null;
    return mismatchedPolicyTransactionMessage;
  }, [
    isMultisig,
    network.chain.stacks.chainId,
    network.id,
    policy,
    publicKey,
    unsignedTxForBroadcast,
  ]);

  async function onApproveTransaction() {
    if (isStacksPolicy) {
      // Only an already-multisig transaction can be proposed from a multisig
      // account; a single-sig transaction would belong to the parent account.
      if (!isMultisig) {
        void chrome.tabs.sendMessage(
          tabId,
          createRpcErrorResponse('stx_signTransaction', {
            id: requestId,
            error: {
              code: RpcErrorCode.INVALID_REQUEST,
              message: nonMultisigPolicyTransactionMessage,
            },
          })
        );
        closeWindow();
        return;
      }

      if (policyTransactionError) {
        void chrome.tabs.sendMessage(
          tabId,
          createRpcErrorResponse('stx_signTransaction', {
            id: requestId,
            error: {
              code: RpcErrorCode.INVALID_REQUEST,
              message: policyTransactionError,
            },
          })
        );
        closeWindow();
        return;
      }
    }

    if (canEditFeeAndNonce) {
      unsignedTxForBroadcast.setFee(selectedFee.txFee.amount.toString());
      unsignedTxForBroadcast.setNonce(nonce);
    }

    if (isSponsored) unsignedTxForBroadcast.setFee(0);

    const signedTransaction = await signStacksTx(unsignedTxForBroadcast);

    if (!signedTransaction) {
      void chrome.tabs.sendMessage(
        tabId,
        createRpcErrorResponse('stx_signTransaction', {
          id: requestId,
          error: {
            code: RpcErrorCode.INVALID_REQUEST,
            message: RpcErrorMessage.UnsignedTransaction,
          },
        })
      );
      throw new Error('Error signing stacks transaction');
    }

    void chrome.tabs.sendMessage(
      tabId,
      createRpcSuccessResponse('stx_signTransaction', {
        id: requestId,
        result: {
          txHex: signedTransaction.serialize(),
          transaction: signedTransaction.serialize(),
        },
      })
    );
    closeWindow();
  }

  const signer = (
    <SigningAccountCard
      address={<AccountStacksAddress />}
      availableBalance={availableBalance}
      fiatBalance={convertToFiatAmount(availableBalance)}
      isLoadingBalance={isLoadingBalance}
    />
  );

  return (
    <RpcTransactionRequestLayout
      title="Sign transaction"
      method={stxSignTransaction.method}
      helpUrl="" // TODO: Need url
      actions={
        <TransactionActionsWithSpend
          isLoading={isLoadingBalance || isLoadingFees}
          isSponsored={unsignedTxForBroadcast.auth.authType === AuthType.Sponsored}
          // TODO: Calculate amount if more than fees
          txAmount={createMoney(0, 'STX')}
          onApprove={onApproveTransaction}
          approvalError={policyTransactionError ?? undefined}
        />
      }
    >
      {isTokenTransferPayload(unsignedTxForBroadcast.payload) ? (
        <>
          {signer}
          <TransactionRecipientsLayout
            title="Stacks"
            caption="Stacks blockchain"
            avatar={<StxAvatarIcon />}
            convertToFiatAmount={convertToFiatAmount}
            recipients={[
              {
                address: isString(unsignedTxForBroadcast.payload.recipient)
                  ? unsignedTxForBroadcast.payload.recipient
                  : unsignedTxForBroadcast.payload.recipient.value,
                amount: createMoney(unsignedTxForBroadcast.payload.amount, 'STX'),
              },
            ]}
          />
        </>
      ) : (
        <>
          <PostConditionsDetailsLayout
            postConditions={unsignedTxForBroadcast.postConditions.values}
            postConditionMode={unsignedTxForBroadcast.postConditionMode}
          />
          {signer}
        </>
      )}
      {isContractCallPayload(unsignedTxForBroadcast.payload) && (
        <ContractCallDetailsLayout
          contractAddress={addressToString(unsignedTxForBroadcast.payload.contractAddress)}
          contractName={unsignedTxForBroadcast.payload.contractName.content}
          functionName={unsignedTxForBroadcast.payload.functionName.content}
          functionArgs={unsignedTxForBroadcast.payload.functionArgs.map(arg => serializeCV(arg))}
        />
      )}
      {isSmartContractPayload(unsignedTxForBroadcast.payload) && (
        <ContractDeployDetailsLayout
          address={address}
          contractName={unsignedTxForBroadcast.payload.contractName.content}
          codeBody={unsignedTxForBroadcast.payload.codeBody.content}
        />
      )}
      {canEditFeeAndNonce && (
        <FeeEditor.Trigger
          feeType="fee-value"
          isLoading={isLoadingFees}
          isSponsored={isSponsored}
          marketData={marketData}
          onEditFee={onUserActivatesFeeEditor}
          selectedFee={selectedFee}
        />
      )}
      {canEditFeeAndNonce && (
        <NonceEditor.Trigger nonce={nonce} onEditNonce={onUserActivatesNonceEditor} />
      )}
    </RpcTransactionRequestLayout>
  );
}
