import { Outlet } from 'react-router';

import { useReceiveDialog } from '@app/common/receive/use-receive-dialog-context';
import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';

export function SwitchAccountLayout() {
  const { isShowingSwitchAccount, setIsShowingSwitchAccount } = useSwitchAccountSheet();
  const { receiveView, setReceiveView } = useReceiveDialog();
  return (
    <Outlet
      context={{ isShowingSwitchAccount, setIsShowingSwitchAccount, receiveView, setReceiveView }}
    />
  );
}
