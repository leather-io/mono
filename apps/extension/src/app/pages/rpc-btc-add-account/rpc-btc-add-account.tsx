import { styled } from 'leather-styles/jsx';

import { Approver, Button, Callout } from '@leather.io/ui';

import { closeWindow } from '@shared/utils';

import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import { policyAccountCallout } from '../policy-account-match';
import { useBtcAddAccount } from './use-btc-add-account';

export function RpcBtcAddAccount() {
  const {
    origin,
    name,
    descriptor,
    matchStatus,
    canApprove,
    focusInitiatingTab,
    onUserApprovesAddAccount,
  } = useBtcAddAccount();

  useOnOriginTabClose(() => closeWindow());

  const { toggleSwitchAccount } = useSwitchAccountSheet();

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  function onApprove() {
    onUserApprovesAddAccount();
    closeWindow();
  }

  const callout = policyAccountCallout(matchStatus, 'Bitcoin');

  return (
    <Approver requester={origin} width="100%">
      <Approver.Header title="Add multisig account" onPressRequestedByLink={focusInitiatingTab} />
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
            onClick={onApprove}
            data-testid="btc-add-account-approve-button"
          >
            Confirm
          </Button>,
        ]}
      />
    </Approver>
  );
}
