import { BaseStxMessageApproverLayout } from '@/features/approver/layouts/base-stx-message-approver.layout';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { deserializeCV } from '@stacks/transactions';

import { RpcRequest, RpcResponse, createRpcSuccessResponse, stxSignMessage } from '@leather.io/rpc';
import { SignatureData } from '@leather.io/stacks';

interface StxSignMessageApproverProps {
  request: RpcRequest<typeof stxSignMessage>;
  sendResult(result: RpcResponse<typeof stxSignMessage>): void;
  closeApprover(): void;
  accountId: string;
}

export function StxSignMessageApprover({
  request,
  closeApprover,
  sendResult,
  accountId,
}: StxSignMessageApproverProps) {
  const { list: accounts } = useAccounts('active');
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  assertStacksSigner(signer);

  async function onApprove() {
    assertStacksSigner(signer);

    function submit(signatureData: SignatureData) {
      const response = createRpcSuccessResponse('stx_signMessage', {
        id: request.id,
        result: signatureData,
      });
      sendResult(response);
    }

    if (request.params.messageType === 'utf8') {
      const signatureData = await signer.signMessage(request.params.message);
      submit(signatureData);
    } else if (request.params.messageType === 'structured') {
      const signatureData = await signer.signStructuredMessage(
        deserializeCV(request.params.message),
        deserializeCV(request.params.domain)
      );
      submit(signatureData);
    }
  }

  return (
    <BaseStxMessageApproverLayout
      onCloseApprover={closeApprover}
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
      messageToSign={request.params}
    />
  );
}
