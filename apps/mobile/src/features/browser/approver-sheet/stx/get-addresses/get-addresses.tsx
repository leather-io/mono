import { useRef, useState } from 'react';

import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { GetAddressesApproverLayout } from '@/features/approver/layouts/get-addresses.layout';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userConnectsApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';
import { bytesToHex } from '@stacks/common';

import { AccountId } from '@leather.io/models';
import {
  RpcRequest,
  RpcResponse,
  createRpcSuccessResponse,
  stxGetAddresses,
} from '@leather.io/rpc';
import { SheetInstance } from '@leather.io/ui/native';

interface StxGetAddressesApproverProps {
  app: App;
  request: RpcRequest<typeof stxGetAddresses>;
  sendResult(result: RpcResponse<typeof stxGetAddresses>): void;
  origin: string;
  closeApprover(): void;
}

export function StxGetAddressesApprover(props: StxGetAddressesApproverProps) {
  const { list: accounts } = useAccounts();
  const dispatch = useAppDispatch();
  const accountSelecterSheetRef = useRef<SheetInstance>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    'accountId' in props.app ? props.app.accountId : null
  );

  const { sendResult } = props;
  const { fromAccountId: stacksAccountFromAccountId } = useStacksSigners();
  const isSubmitDisabled = !selectedAccountId;

  function onApprove() {
    if (isSubmitDisabled) return;
    const account = stacksAccountFromAccountId(selectedAccountId)[0];
    if (!account) return;

    const stacksAddressResponse = {
      address: account.address,
      publicKey: bytesToHex(account.publicKey),
      derivationPath: account.derivationPath,
    };

    const response = createRpcSuccessResponse('stx_getAddresses', {
      result: [stacksAddressResponse],
      id: props.request.id,
    });

    dispatch(
      userConnectsApp({
        origin: props.origin,
        accountId: selectedAccountId,
      })
    );

    sendResult(response);
  }

  function onOpenAccountSelection() {
    accountSelecterSheetRef.current?.present();
  }
  function onAccountPress(account: AccountId) {
    setSelectedAccountId(makeAccountIdentifer(account.fingerprint, account.accountIndex));
    accountSelecterSheetRef.current?.close();
  }
  return (
    <>
      <GetAddressesApproverLayout
        requester={props.origin}
        onApprove={onApprove}
        onOpenAccountSelection={onOpenAccountSelection}
        onCloseApprover={props.closeApprover}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        isSubmitDisabled={isSubmitDisabled}
      />
      <AccountSelectorSheet sheetRef={accountSelecterSheetRef} onAccountPress={onAccountPress} />
    </>
  );
}
