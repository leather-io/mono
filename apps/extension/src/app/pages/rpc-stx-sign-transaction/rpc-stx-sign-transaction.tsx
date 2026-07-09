import { useMemo } from 'react';
import { useSelector } from 'react-redux';

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
import { getTxSenderAddress } from '@app/common/transactions/stacks/transaction.utils';
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
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { selectAllPolicies, useCurrentPolicy } from '@app/store/policy/policy.selectors';
import { useSignStacksTransactionWithAccount } from '@app/store/transactions/transaction.hooks';

import {
  checkUnsignedStacksTransactionHashMode,
  getUnsignedStacksTransactionFromRpcRequest,
} from './rpc-stx-sign-transaction.utils';

export function RpcStxSignTransaction() {
  const { address, isLoadingBalance, requestId, tabId } = useStacksRpcTransactionRequestContext();
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

  const unsignedTxForBroadcast = useMemo(() => getUnsignedStacksTransactionFromRpcRequest(), []);

  // Handle multisig transactions
  const isMultisig = checkUnsignedStacksTransactionHashMode(unsignedTxForBroadcast);
  const canEditFeeAndNonce = !isMultisig;

  const currentAccountId = useCurrentAccountId();
  const policies = useSelector(selectAllPolicies);
  const currentPolicy = useCurrentPolicy();
  const signerPolicy = useMemo(() => {
    if (!isMultisig) return undefined;
    const txSenderAddress = getTxSenderAddress(unsignedTxForBroadcast);
    const matches = policies.filter(
      policy => policy.chain === 'stacks' && policy.address === txSenderAddress
    );
    return matches.find(policy => policy.id === currentPolicy?.id) ?? matches[0];
  }, [isMultisig, unsignedTxForBroadcast, policies, currentPolicy]);
  const signerAccountId = useMemo(
    () => (signerPolicy ? parsePolicyParent(signerPolicy.parentAccountId) : currentAccountId),
    [signerPolicy, currentAccountId]
  );
  const signerAccount = useStacksAccount(signerAccountId);
  const signStacksTx = useSignStacksTransactionWithAccount(signerAccount);

  async function onApproveTransaction() {
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
      showPolicyAccount={Boolean(signerPolicy)}
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
