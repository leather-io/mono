import { useRef, useState } from 'react';

import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import { useAccounts } from '@/store/accounts/accounts.read';
import { App } from '@/store/apps/utils';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { destructAccountIdentifier, makeAccountIdentifer } from '@/store/utils';

import { RpcRequest, RpcResponse, createRpcSuccessResponse, signMessage } from '@leather.io/rpc';
import { SheetRef } from '@leather.io/ui/native';

import { signBip322Message } from './bip322-signer';
import { SignMessageApproverLayout } from './sign-message.layout';

interface SignMessageApproverProps {
  app: App;
  request: RpcRequest<typeof signMessage>;
  sendResult(result: RpcResponse<typeof signMessage>): void;
  closeApprover(): void;
}

export function SignMessageApprover(props: SignMessageApproverProps) {
  const { list: accounts } = useAccounts('active');
  const accountSelecterSheetRef = useRef<SheetRef>(null);

  function getDefaultAccountId() {
    if (!('accountId' in props.app)) return null;

    const requestedAccountIndex = props.request.params.account;
    const normalizedAccIdx = requestedAccountIndex ? requestedAccountIndex - 1 : undefined;
    if (
      normalizedAccIdx !== undefined &&
      normalizedAccIdx >= 0 &&
      normalizedAccIdx < accounts.length
    ) {
      const { fingerprint } = destructAccountIdentifier(props.app.accountId);
      return makeAccountIdentifer(fingerprint, normalizedAccIdx);
    }

    return props.app.accountId;
  }
  const defaultAccountId = getDefaultAccountId();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(defaultAccountId);
  const network = useCurrentNetworkState();
  const { accountIndexByPaymentType } = useBitcoinAccounts();
  const { sendResult } = props;

  async function onApprove() {
    if (!selectedAccountId) return;
    const result = await signBip322Message({
      message: props.request,
      accountId: selectedAccountId,
      network,
      accountIndexByPaymentType,
    });
    const response = createRpcSuccessResponse('signMessage', {
      result,
      id: props.request.id,
    });

    sendResult(response);
  }

  function onOpenAccountSelection() {
    accountSelecterSheetRef.current?.present();
  }
  function onAccountPress(accountId: string) {
    setSelectedAccountId(accountId);
    accountSelecterSheetRef.current?.close();
  }
  return (
    <>
      <SignMessageApproverLayout
        onApprove={onApprove}
        onOpenAccountSelection={onOpenAccountSelection}
        onCloseApprover={props.closeApprover}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        messageToSign={props.request.params.message}
      />
      <AccountSelectorSheet sheetRef={accountSelecterSheetRef} onAccountPress={onAccountPress} />
    </>
  );
}
