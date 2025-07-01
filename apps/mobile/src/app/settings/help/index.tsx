import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useBrowser } from '@/core/browser-provider';
import SettingsLayout from '@/features/settings/settings-layout';
import { t } from '@lingui/macro';

import { LEATHER_GUIDES_URL, LEATHER_LEARN_URL, LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { GraduateCapIcon, MagicBookIcon, SupportIcon } from '@leather.io/ui/native';

export default function SettingsHelpScreen() {
  const { linkingRef } = useBrowser();

  return (
    <SettingsLayout
      title={t({
        id: 'networks.header_title',
        message: 'Networks',
      })}
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'help.support.cell_title',
            message: 'Contact us',
          })}
          caption={t({
            id: 'help.support.cell_caption',
            message: 'Get support or provide feedback',
          })}
          icon={<SupportIcon />}
          onPress={() => linkingRef.current?.openURL(LEATHER_SUPPORT_URL)}
        />
        <SettingsListItem
          title={t({
            id: 'help.guides.cell_title',
            message: 'Guides',
          })}
          caption={t({
            id: 'help.guides.cell_caption',
            message: 'Dive into feature details',
          })}
          icon={<MagicBookIcon />}
          onPress={() => linkingRef.current?.openURL(LEATHER_GUIDES_URL)}
        />
        <SettingsListItem
          title={t({
            id: 'help.learn.cell_title',
            message: 'Learn',
          })}
          caption={t({
            id: 'help.learn.cell_caption',
            message: 'Expand your Bitcoin knowledge',
          })}
          icon={<GraduateCapIcon />}
          onPress={() => linkingRef.current?.openURL(LEATHER_LEARN_URL)}
        />
      </SettingsList>
    </SettingsLayout>
  );
}
