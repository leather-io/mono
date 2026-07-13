import { useMemo } from 'react';

import { stxCallContract } from '@leather.io/rpc';
import {
  ensurePostConditionWireFormat,
  generateStacksUnsignedTransaction,
  toUnsignedMultiSigStacksOptions,
} from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { useConvertCryptoCurrencyToFiatAmount } from '@app/common/hooks/use-convert-to-fiat-amount';
import { AccountStacksAddress } from '@app/components/account/account-stacks-address';
import { FeeEditor } from '@app/features/fee-editor/fee-editor';
import { useFeeEditorContext } from '@app/features/fee-editor/fee-editor.context';
import { NonceEditor } from '@app/features/nonce-editor/nonce-editor';
import { useNonceEditorContext } from '@app/features/nonce-editor/nonce-editor.context';
import { RpcTransactionRequestLayout } from '@app/features/rpc-stacks-transaction-request/rpc-transaction-request.layout';
import { SigningAccountCard } from '@app/features/rpc-stacks-transaction-request/signing-account-card/signing-account-card';
import { ContractCallDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/contract-call/contract-call-details.layout';
import { PostConditionsDetailsLayout } from '@app/features/rpc-stacks-transaction-request/stacks/post-conditions/post-conditions-details.layout';
import { useStacksRpcTransactionRequestContext } from '@app/features/rpc-stacks-transaction-request/stacks/stacks-rpc-transaction-request.context';
import { useProposeStacksTransaction } from '@app/features/rpc-stacks-transaction-request/stacks/use-propose-stacks-transaction';
import { useSignAndBroadcastStacksTransaction } from '@app/features/rpc-stacks-transaction-request/stacks/use-sign-and-broadcast-stacks-transaction';
import { useStacksRpcTransactionRequestApproval } from '@app/features/rpc-stacks-transaction-request/stacks/use-stacks-rpc-transaction-request-approval';
import { TransactionActionsWithSpend } from '@app/features/rpc-stacks-transaction-request/transaction-actions/transaction-actions-with-spend';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import {
  getDecodedRpcStxCallContractRequest,
  getUnsignedStacksContractCallOptions,
} from './rpc-stx-call-contract.utils';

export function RpcStxCallContract() {
  const { isLoadingBalance, network, publicKey } = useStacksRpcTransactionRequestContext();
  const {
    availableBalance,
    isLoadingFees,
    isSponsored,
    marketData,
    onUserActivatesFeeEditor,
    selectedFee,
  } = useFeeEditorContext();
  const { nonce, onUserActivatesNonceEditor } = useNonceEditorContext();
  const signAndBroadcastTransaction = useSignAndBroadcastStacksTransaction(stxCallContract.method);
  const proposeTransaction = useProposeStacksTransaction(stxCallContract.method);
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';
  const convertToFiatAmount = useConvertCryptoCurrencyToFiatAmount('STX');

  const rpcRequest = useMemo(() => getDecodedRpcStxCallContractRequest(), []);
  const txOptionsForBroadcast = useMemo(
    () =>
      getUnsignedStacksContractCallOptions({
        fee: isSponsored ? createMoney(0, 'STX') : selectedFee.txFee,
        network,
        nonce,
        publicKey,
      }),
    [isSponsored, network, nonce, publicKey, selectedFee.txFee]
  );

  async function onApproveTransaction() {
    if (isStacksPolicy) {
      const unsignedMultisigTx = await generateStacksUnsignedTransaction(
        toUnsignedMultiSigStacksOptions(txOptionsForBroadcast, {
          publicKeys: policy.publicKeys,
          numSignatures: policy.threshold,
        })
      );
      return proposeTransaction(unsignedMultisigTx);
    }
    const unsignedTx = await generateStacksUnsignedTransaction(txOptionsForBroadcast);
    await signAndBroadcastTransaction(unsignedTx);
  }
  const onApprove = useStacksRpcTransactionRequestApproval(onApproveTransaction);

  return (
    <RpcTransactionRequestLayout
      title={rpcRequest.params.postConditions?.length ? 'Sign transaction' : 'Sign contract'}
      method={stxCallContract.method}
      actions={
        <TransactionActionsWithSpend
          isLoading={isLoadingBalance || isLoadingFees}
          isSponsored={isSponsored}
          // TODO: Calculate total request
          txAmount={createMoney(0, 'STX')}
          onApprove={onApprove}
          approveLabel={isStacksPolicy ? 'Propose transaction' : undefined}
          busyLabel={isStacksPolicy ? 'Proposing...' : undefined}
        />
      }
    >
      <PostConditionsDetailsLayout
        postConditions={(txOptionsForBroadcast.postConditions ?? []).map(pc =>
          ensurePostConditionWireFormat(pc)
        )}
        postConditionMode={txOptionsForBroadcast.postConditionMode}
      />
      <SigningAccountCard
        address={<AccountStacksAddress />}
        availableBalance={availableBalance}
        fiatBalance={convertToFiatAmount(availableBalance)}
        isLoadingBalance={isLoadingBalance}
        showPolicyAccount={isStacksPolicy}
      />
      <ContractCallDetailsLayout
        contractAddress={txOptionsForBroadcast.contractAddress}
        contractName={txOptionsForBroadcast.contractName}
        functionName={txOptionsForBroadcast.functionName}
        functionArgs={txOptionsForBroadcast.functionArgs}
      />
      <FeeEditor.Trigger
        feeType="fee-value"
        isLoading={isLoadingFees}
        isSponsored={isSponsored}
        marketData={marketData}
        onEditFee={onUserActivatesFeeEditor}
        selectedFee={selectedFee}
      />
      <NonceEditor.Trigger nonce={nonce} onEditNonce={onUserActivatesNonceEditor} />
    </RpcTransactionRequestLayout>
  );
}
