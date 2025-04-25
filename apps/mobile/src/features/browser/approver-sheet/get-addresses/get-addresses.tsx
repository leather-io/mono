import { useRef, useState } from 'react';

import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { GetAddressesApproverLayout } from '@/features/approver/layouts/get-addresses.layout';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userConnectsApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';

import { keyOriginToDerivationPath } from '@leather.io/crypto';
import { RpcRequest, RpcResponse, createRpcSuccessResponse, getAddresses } from '@leather.io/rpc';
import { SheetRef } from '@leather.io/ui/native';

import { useGetAddressesAccount } from './get-addresses.hooks';
import { formatAddressesForGetAddresses } from './utils';

interface GetAddressesApproverProps {
  app: App;
  request: RpcRequest<typeof getAddresses>;
  sendResult(result: RpcResponse<typeof getAddresses>): void;
  origin: string;
  closeApprover(): void;
}

export function GetAddressesApprover(props: GetAddressesApproverProps) {
  const { list: accounts } = useAccounts();
  const dispatch = useAppDispatch();
  const accountSelecterSheetRef = useRef<SheetRef>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    'accountId' in props.app ? props.app.accountId : null
  );

  const { sendResult } = props;
  const account = useGetAddressesAccount(selectedAccountId);

  function onApprove() {
    if (!account) return;
    const keysToIncludeInResponse = formatAddressesForGetAddresses({
      taproot: {
        address: account.taprootPayer.address,
        publicKey: account.taprootPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(account.taprootPayer.keyOrigin),
      },
      nativeSegwit: {
        address: account.nativeSegwitPayer.address,
        publicKey: account.nativeSegwitPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(account.nativeSegwitPayer.keyOrigin),
      },
      stacksAccount: {
        address: account.stacksAccount.address,
        publicKey: account.stacksAccount.publicKey,
      },
    });
    const result = { addresses: keysToIncludeInResponse };
    const response = createRpcSuccessResponse('getAddresses', {
      result,
      id: props.request.id,
    });

    dispatch(
      userConnectsApp({
        origin: props.origin,
        accountId: makeAccountIdentifer(account.fingerprint, account.accountIndex),
      })
    );

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
      <GetAddressesApproverLayout
        onApprove={onApprove}
        onOpenAccountSelection={onOpenAccountSelection}
        onCloseApprover={props.closeApprover}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
      />
      <AccountSelectorSheet sheetRef={accountSelecterSheetRef} onAccountPress={onAccountPress} />
    </>
  );
}
