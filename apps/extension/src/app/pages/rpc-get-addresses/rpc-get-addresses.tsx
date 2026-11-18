import { useEffect } from 'react';

import { closeWindow } from '@shared/utils';

import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { CrossOriginFrameCallout } from '@app/components/cross-origin-frame-callout';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import { ConnectAccountLayout } from '../../components/connect-account/connect-account.layout';
import { GetAddressesMissingAccountCallout } from './get-addresses-missing-account-callout';
import { useGetAddresses } from './use-get-addresses';

export function RpcGetAddresses() {
  const {
    focusInitiatingTab,
    origin,
    onUserApproveGetAddresses,
    allowPolicyAccounts,
    missingChain,
    hasAvailableRequestedChain,
  } = useGetAddresses();

  useOnOriginTabClose(() => closeWindow());

  const { toggleSwitchAccount, setAllowPolicyAccounts } = useSwitchAccountSheet();

  useEffect(() => {
    setAllowPolicyAccounts(allowPolicyAccounts);
  }, [allowPolicyAccounts, setAllowPolicyAccounts]);

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  return (
    <ConnectAccountLayout
      requester={origin}
      onClickRequestedByLink={focusInitiatingTab}
      banner={
        <>
          <CrossOriginFrameCallout mt="space.03" mb="space.05" width="100%" />
          {missingChain ? (
            <GetAddressesMissingAccountCallout
              missingChain={missingChain}
              hasAvailableRequestedChain={hasAvailableRequestedChain}
            />
          ) : undefined}
        </>
      }
      switchAccount={
        <CurrentAccountDisplayer
          onSelectAccount={toggleSwitchAccount}
          allowPolicyAccounts={allowPolicyAccounts}
        />
      }
      onUserApprovesGetAddresses={onUserApproveGetAddresses}
    />
  );
}
