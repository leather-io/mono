import { useRef, useState } from 'react';

import { formatAddressesForGetAddresses } from '@/components/browser/get-addresses';
import { AccountSelectorSheet } from '@/features/accounts/account-selector/account-selector-sheet';
import { useAccounts } from '@/store/accounts/accounts.read';
import { userConnectsApp } from '@/store/apps/apps.write';
import { App } from '@/store/apps/utils';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { destructAccountIdentifier, makeAccountIdentifer, useAppDispatch } from '@/store/utils';

import { keyOriginToDerivationPath } from '@leather.io/crypto';
import { RpcRequest, createRpcSuccessResponse, getAddresses } from '@leather.io/rpc';
import { SheetRef } from '@leather.io/ui/native';

import { GetAddressesApproverLayout } from './get-addresses.layout';

function useGetAddressesAccount(accountId: string | null) {
  const { fromAccountIndex: stacksAccountFromAccountIndex } = useStacksSigners();
  const { accountIndexByPaymentType } = useBitcoinAccounts();
  const { fromAccountIndex: accountFromAccountIndex } = useAccounts();
  if (!accountId) return null;
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const account = accountFromAccountIndex(fingerprint, accountIndex);

  if (!account) return null;

  const stacksAccount = stacksAccountFromAccountIndex(fingerprint, accountIndex)[0];
  const { nativeSegwit, taproot } = accountIndexByPaymentType(fingerprint, accountIndex);

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });
  if (!stacksAccount || !nativeSegwitPayer || !taprootPayer)
    throw new Error('some of the accounts are not available');
  return { fingerprint, accountIndex, taprootPayer, nativeSegwitPayer, stacksAccount };
}

interface GetAddressesApproverProps {
  app: App;
  message: RpcRequest<typeof getAddresses>;
  sendResult(result: object): void;
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
      id: props.message.id,
    });

    if (props.origin) {
      dispatch(
        userConnectsApp({
          origin: props.origin,
          accountId: makeAccountIdentifer(account.fingerprint, account.accountIndex),
        })
      );
    }

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
