import { BaseStxMessageApproverLayout } from '@/features/approver/layouts/base-stx-message-approver.layout';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { deserializeCV } from '@stacks/transactions';

import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxSignStructuredMessage,
} from '@leather.io/rpc';

interface StxSignStructuredMessageApproverProps {
  app: App;
  request: RpcRequest<typeof stxSignStructuredMessage>;
  sendResult(result: RpcResponse<typeof stxSignStructuredMessage>): void;
  closeApprover(): void;
  accountId: string;
}

export function StxSignStructuredMessageApprover({
  app,
  request,
  closeApprover,
  sendResult,
  accountId,
}: StxSignStructuredMessageApproverProps) {
  const { list: accounts } = useAccounts();
  const signer = useStacksSigners().fromAccountId(accountId)[0];
  assertStacksSigner(signer);

  async function onApprove() {
    assertStacksSigner(signer);

    const signatureData = await signer.signStructuredMessage(
      deserializeCV(request.params.message),
      deserializeCV(request.params.domain)
    );
    const response = createRpcSuccessResponse('stx_signStructuredMessage', {
      id: request.id,
      result: signatureData,
    });
    sendResult(response);
  }

  return (
    <BaseStxMessageApproverLayout
      origin={app.origin}
      onCloseApprover={closeApprover}
      accountId={accountId}
      accounts={accounts}
      onApprove={onApprove}
      messageToSign={{ ...request.params, messageType: 'structured' }}
    />
  );
}
