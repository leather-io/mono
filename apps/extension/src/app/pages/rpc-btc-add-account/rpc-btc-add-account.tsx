import { useRef } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, Approver, Button, Callout } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import { policyCallout, verifyModeCalloutMessage } from '../policy-match';
import { useBtcAddAccount } from './use-btc-add-account';

export function RpcBtcAddAccount() {
  const {
    origin,
    name,
    descriptor,
    address,
    matchStatus,
    mode,
    walletType,
    canApprove,
    isFeatureEnabled,
    rejectAsUnsupported,
    focusInitiatingTab,
    finalize,
  } = useBtcAddAccount();

  const navigate = useNavigate();
  const isFinalizingRef = useRef(false);

  useOnOriginTabClose(() => closeWindow());

  const { toggleSwitchAccount } = useSwitchAccountSheet();

  useOnMount(() => {
    if (!isFeatureEnabled) rejectAsUnsupported();
  });

  if (!isFeatureEnabled) return null;

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  async function onApprove() {
    // Ledger confirms the address on-device first; the nested flow finalizes and
    // responds to the dApp once the user approves on the device.
    if (walletType === 'ledger') {
      void navigate(RouteUrls.ConnectLedger, {
        relative: 'route',
        state: { backgroundLocation: { pathname: RouteUrls.Home } },
      });
      return;
    }
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;
    await finalize();
    closeWindow();
  }

  const isVerifyMode = mode === 'verify';
  const confirmLabel = `${isVerifyMode ? 'Verify' : 'Confirm'}${walletType === 'ledger' ? ' on Ledger' : ''}`;
  const callout = policyCallout(matchStatus, 'Bitcoin');

  return (
    <>
      <Approver requester={origin} width="100%">
        <Approver.Header
          title={isVerifyMode ? 'Verify multisig address' : 'Add multisig account'}
          onPressRequestedByLink={focusInitiatingTab}
        />
        {isVerifyMode && (
          <Approver.Section>
            <Callout variant="warning" mt="space.03">
              {verifyModeCalloutMessage}
            </Callout>
          </Approver.Section>
        )}
        <Approver.Section>
          <Approver.Subheader>Multisig address</Approver.Subheader>
          {address ? (
            <styled.div pb="space.03">
              <AddressDisplayer address={address} />
            </styled.div>
          ) : (
            <Callout variant="error" mt="space.03" mb="space.03">
              Could not derive the address for this multisig account.
            </Callout>
          )}
        </Approver.Section>
        <Approver.Section>
          <Approver.Subheader>With account</Approver.Subheader>
          <CurrentAccountDisplayer onSelectAccount={toggleSwitchAccount} />
          <Callout variant={callout.variant} mt="space.04" mb="space.03">
            {callout.message}
          </Callout>
        </Approver.Section>
        <Approver.Section>
          <Approver.Subheader>Account name</Approver.Subheader>
          <styled.p textStyle="caption.01" pb="space.03">
            {name}
          </styled.p>
        </Approver.Section>
        <Approver.Section>
          <Approver.Subheader>Bitcoin descriptor</Approver.Subheader>
          <styled.p textStyle="caption.01" wordBreak="break-all" pb="space.03">
            {descriptor}
          </styled.p>
        </Approver.Section>
        <Approver.Actions
          actions={[
            <Button key="deny" variant="outline" onClick={() => closeWindow()}>
              Deny
            </Button>,
            <Button
              key="confirm"
              disabled={!canApprove}
              onClick={() => void onApprove()}
              data-testid="btc-add-account-approve-button"
            >
              {confirmLabel}
            </Button>,
          ]}
        />
      </Approver>
      <Outlet />
    </>
  );
}
