import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useOpenURL } from '@/features/browser/browser/use-open-url';
import SettingsLayout from '@/features/settings/settings-layout';
import { t } from '@lingui/core/macro';

import { LEATHER_GUIDES_URL, LEATHER_LEARN_URL, LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { GraduateCapIcon, MagicBookIcon, SupportIcon } from '@leather.io/ui/native';

export default function SettingsHelpScreen() {
  const { openURL } = useOpenURL();

  return (
    <SettingsLayout title={t`Networks`}>
      <SettingsList>
        <SettingsListItem
          title={t`Contact us`}
          caption={t`Get support or provide feedback`}
          icon={<SupportIcon />}
          onPress={() => openURL(LEATHER_SUPPORT_URL)}
        />
        <SettingsListItem
          title={t`Guides`}
          caption={t`Dive into feature details`}
          icon={<MagicBookIcon />}
          onPress={() => openURL(LEATHER_GUIDES_URL)}
        />
        <SettingsListItem
          title={t`Learn`}
          caption={t`Expand your Bitcoin knowledge`}
          icon={<GraduateCapIcon />}
          onPress={() => openURL(LEATHER_LEARN_URL)}
        />
      </SettingsList>
    </SettingsLayout>
  );
}
