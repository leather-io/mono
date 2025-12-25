import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { Settings } from '@app/features/settings/settings';

import { HeaderGridRightCol } from './header-grid';

export function HeaderSettingsButton() {
  const { isShowingSwitchAccount, setIsShowingSwitchAccount } = useSwitchAccountSheet();

  return (
    <HeaderGridRightCol>
      <Settings toggleSwitchAccount={() => setIsShowingSwitchAccount(!isShowingSwitchAccount)} />
    </HeaderGridRightCol>
  );
}
