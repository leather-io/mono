import { useRef } from 'react';
import { Outlet, useNavigate } from 'react-router';

import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { styled } from 'leather-styles/jsx';

import { AddressDisplayer, Approver, Button, Callout } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import {
  BondSpendingConditions,
  type BondSpendingDetails,
} from '@app/components/bond-spending-conditions';
import { CrossOriginFrameCallout } from '@app/components/cross-origin-frame-callout';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { ledgerRawKeyUnsupportedMessage } from '@app/features/ledger/utils/ledger-descriptor-address';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import {
  policyCallout,
  timelockedVerifyCalloutMessage,
  verifyModeCalloutMessage,
} from '../policy-match';
import { useBtcAddAccount } from './use-btc-add-account';

function getApproverTitle(isTimelocked: boolean, isVerifyMode: boolean) {
  if (isTimelocked) return 'Verify timelocked address';
  return isVerifyMode ? 'Verify multisig address' : 'Add multisig account';
}

function getApprovalSubject(timelock: BondSpendingDetails | null) {
  if (!timelock) return 'this multisig account';
  return timelock.vaultKind === 'pk' ? 'this timelocked address' : 'this vault';
}

export function RpcBtcAddAccount() {
  const {
    origin,
    name,
    descriptor,
    address,
    kind,
    timelock,
    matchStatus,
    mode,
    walletType,
    isLedgerVerifyUnsupported,
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
  const isTimelocked = kind === 'timelocked';
  const subject = getApprovalSubject(timelock);
  const confirmLabel = `${isVerifyMode ? 'Verify' : 'Confirm'}${walletType === 'ledger' ? ' on Ledger' : ''}`;
  const callout = policyCallout(matchStatus, 'Bitcoin', subject);

  return (
    <>
      <Approver requester={origin} width="100%">
        <CrossOriginFrameCallout mb="space.03" width="100%" />
        <Approver.Header
          title={getApproverTitle(isTimelocked, isVerifyMode)}
          onPressRequestedByLink={focusInitiatingTab}
        />
        {isVerifyMode && (
          <Approver.Section>
            <Callout variant={isTimelocked ? 'info' : 'warning'} mt="space.03">
              {isTimelocked ? timelockedVerifyCalloutMessage : verifyModeCalloutMessage}
            </Callout>
          </Approver.Section>
        )}
        {isLedgerVerifyUnsupported && (
          <Approver.Section>
            <Callout variant="warning" mt="space.03">
              {ledgerRawKeyUnsupportedMessage}
            </Callout>
          </Approver.Section>
        )}
        <Approver.Section>
          <Approver.Subheader>
            {isTimelocked ? 'Timelocked address' : 'Multisig address'}
          </Approver.Subheader>
          {address ? (
            <styled.div pb="space.03">
              <AddressDisplayer
                data-testid={SharedComponentsSelectors.AddressDisplayer}
                address={address}
              />
            </styled.div>
          ) : (
            <Callout variant="error" mt="space.03" mb="space.03">
              Could not derive the address for {subject}.
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
        {timelock && (
          <Approver.Section>
            <Approver.Subheader>Spending conditions</Approver.Subheader>
            <styled.div pb="space.03">
              <BondSpendingConditions details={timelock} />
            </styled.div>
          </Approver.Section>
        )}
        {!isTimelocked && (
          <Approver.Section>
            <Approver.Subheader>Account name</Approver.Subheader>
            <styled.p textStyle="caption.01" pb="space.03">
              {name}
            </styled.p>
          </Approver.Section>
        )}
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
