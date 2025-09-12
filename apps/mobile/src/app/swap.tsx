import { Screen } from '@/components/screen/screen';
import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { HeaderTitle } from '@/components/screen/screen-header/components/header-title';
import { Swap } from '@/features/swap/swap';
import { t } from '@lingui/core/macro';

export default function SwapScreen() {
  return (
    <Screen>
      <Screen.Header
        leftElement={<HeaderBackButton />}
        centerElement={<HeaderTitle title={t`Swap`} />}
      />
      <Screen.Body>
        <Swap />
      </Screen.Body>
    </Screen>
  );
}
