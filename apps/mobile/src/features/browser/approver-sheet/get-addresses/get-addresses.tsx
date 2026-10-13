import { useRef, useState } from 'react';

import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { GetAddressesApproverLayout } from '@/features/approver/layouts/get-addresses.layout';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userConnectsApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useAppDispatch } from '@/store/utils';

import { keyOriginToDerivationPath, makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId } from '@leather.io/models';
import { RpcRequest, RpcResponse, createRpcSuccessResponse, getAddresses } from '@leather.io/rpc';
import { SheetInstance } from '@leather.io/ui/native';

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
  const accountSelecterSheetRef = useRef<SheetInstance>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    'accountId' in props.app ? props.app.accountId : null
  );

  const { sendResult } = props;
  const account = useGetAddressesAccount(selectedAccountId);
  const isSubmitDisabled = !account;

  function onApprove() {
    if (isSubmitDisabled) return;
    const keysToIncludeInResponse = formatAddressesForGetAddresses({
      fingerprint: account.fingerprint,
      taproot: {
        address: account.taprootPayer.address,
        publicKey: account.taprootPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(account.taprootPayer.keyOrigin),
        descriptor: account.taprootDescriptor,
      },
      nativeSegwit: {
        address: account.nativeSegwitPayer.address,
        publicKey: account.nativeSegwitPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(account.nativeSegwitPayer.keyOrigin),
        descriptor: account.nativeSegwitDescriptor,
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
  function onAccountPress(account: AccountId) {
    setSelectedAccountId(makeAccountIdentifer(account.fingerprint, account.accountIndex));
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
        requester={props.origin}
        isSubmitDisabled={isSubmitDisabled}
      />
      <AccountSelectorSheet sheetRef={accountSelecterSheetRef} onAccountPress={onAccountPress} />
    </>
  );
}
