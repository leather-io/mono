import { useRef } from 'react';

import { VStack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, Approver, Button, Callout } from '@leather.io/ui';

import { closeWindow } from '@shared/utils';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { CrossOriginFrameCallout } from '@app/components/cross-origin-frame-callout';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import { policyCallout, verifyModeCalloutMessage } from '../policy-match';
import { useStxAddAccount } from './use-stx-add-account';

export function RpcStxAddAccount() {
  const {
    origin,
    name,
    publicKeys,
    threshold,
    address,
    matchStatus,
    mode,
    canApprove,
    isFeatureEnabled,
    rejectAsUnsupported,
    focusInitiatingTab,
    finalize,
  } = useStxAddAccount();

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
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;
    await finalize();
    closeWindow();
  }

  const isVerifyMode = mode === 'verify';
  const callout = policyCallout(matchStatus, 'Stacks');

  return (
    <Approver requester={origin} width="100%">
      <CrossOriginFrameCallout mb="space.03" width="100%" />
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
        <Approver.Subheader>Signing policy</Approver.Subheader>
        <styled.p textStyle="caption.01" pb="space.03">
          {threshold} of {publicKeys.length}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Public keys</Approver.Subheader>
        <VStack gap="space.01" alignItems="start" pb="space.03">
          {publicKeys.map(publicKey => (
            <styled.p key={publicKey} textStyle="caption.01" wordBreak="break-all">
              {publicKey}
            </styled.p>
          ))}
        </VStack>
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
            data-testid="stx-add-account-approve-button"
          >
            {isVerifyMode ? 'Verify' : 'Confirm'}
          </Button>,
        ]}
      />
    </Approver>
  );
}
