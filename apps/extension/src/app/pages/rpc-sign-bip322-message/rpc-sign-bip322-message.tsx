import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { ChainId } from '@stacks/network';

import { truncateMiddle } from '@leather.io/utils';

import { closeWindow } from '@shared/utils';

import { Disclaimer } from '@app/components/disclaimer';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';
import { PopupHeader } from '@app/features/container/headers/popup.header';
import { MessagePreviewBox } from '@app/features/message-signer/message-preview-box';
import { MessageSigningRequestLayout } from '@app/features/message-signer/message-signing-request.layout';
import { SignMessageMissingAccountError } from '@app/features/message-signer/sign-message-missing-account-error';
import { AccountGate } from '@app/routes/account-gate';
import { useHasCurrentBitcoinAccount } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

import { MessageSigningHeader } from '../../features/message-signer/message-signing-header';
import { SignMessageActions } from '../../features/message-signer/stacks-sign-message-action';
import { useSignBip322Message } from './use-sign-bip322-message';

// Imported dynamically
// ts-unused-exports:disable-next-line
export function RpcSignBip322MessageRoute() {
  return (
    <AccountGate>
      <RpcSignBip322MessageContainer />
    </AccountGate>
  );
}

function RpcSignBip322MessageContainer() {
  const hasBitcoinAccount = useHasCurrentBitcoinAccount();
  if (!hasBitcoinAccount) return <SignMessageMissingAccountError chain="bitcoin" />;
  return <RpcSignBip322Message />;
}

function RpcSignBip322Message() {
  const {
    origin,
    message,
    address,
    networkMode,
    isLoading: signBip322MessageIsLoading,
    onUserApproveBip322MessageSigningRequest,
    onUserRejectBip322MessageSigningRequest,
  } = useSignBip322Message();

  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  // if user has wentBack need to stop button loading so they can retry
  useEffect(() => {
    if (location?.state?.wentBack) {
      setIsLoading(false);
    } else {
      setIsLoading(signBip322MessageIsLoading);
    }
  }, [location, signBip322MessageIsLoading, isLoading, setIsLoading]);

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  return (
    <>
      <Outlet />
      <PopupHeader showSwitchAccount balance="all" />
      <MessageSigningRequestLayout>
        <MessageSigningHeader
          origin={origin}
          additionalText={`. This message is signed by ${truncateMiddle(address)}`}
        />
        <MessagePreviewBox message={message} />
        <NoFeesWarningRow chainId={networkMode === 'mainnet' ? ChainId.Mainnet : ChainId.Testnet} />
        <SignMessageActions
          isLoading={isLoading}
          onSignMessage={() => onUserApproveBip322MessageSigningRequest()}
          onSignMessageCancel={() => onUserRejectBip322MessageSigningRequest()}
        />
        <hr />
        <Disclaimer
          disclaimerText="By signing this message, you prove that you own this address"
          mb="space.05"
        />
      </MessageSigningRequestLayout>
    </>
  );
}
