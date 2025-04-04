import { Linking } from 'react-native';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { NetworkBadge } from '@/features/settings/network-badge';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { LEATHER_GUIDES_URL, LEATHER_LEARN_URL, LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { GraduateCapIcon, MagicBookIcon, SupportIcon } from '@leather.io/ui/native';

export default function SettingsHelpScreen() {
  return (
    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={t({
        id: 'help.header_title',
        message: 'Help',
      })}
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'help.support.cell_title',
            message: 'Support and feedback',
          })}
          caption={t({
            id: 'help.support.cell_caption',
            message: 'Contact our support team',
          })}
          testID={TestId.settingsSupportButton}
          icon={<SupportIcon />}
          onPress={() => void Linking.openURL(LEATHER_SUPPORT_URL)}
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
          testID={TestId.settingsGuidesButton}
          icon={<MagicBookIcon />}
          onPress={() => void Linking.openURL(LEATHER_GUIDES_URL)}
        />
        <SettingsListItem
          title={t({
            id: 'help.learn.cell_title',
            message: 'Learn',
          })}
          caption={t({
            id: 'help.learn.cell_caption',
            message: 'Expand your knowledge',
          })}
          testID={TestId.settingsLearnButton}
          icon={<GraduateCapIcon />}
          onPress={() => void Linking.openURL(LEATHER_LEARN_URL)}
        />
      </SettingsList>
    </AnimatedHeaderScreenLayout>
  );
}
