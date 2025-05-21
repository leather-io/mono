import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useBrowser } from '@/core/browser-provider';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';

import { LEATHER_GUIDES_URL, LEATHER_LEARN_URL, LEATHER_SUPPORT_URL } from '@leather.io/constants';
import { GraduateCapIcon, MagicBookIcon, SupportIcon } from '@leather.io/ui/native';

export default function SettingsHelpScreen() {
  const { linkingRef } = useBrowser();
  const pageTitle = t({
    id: 'help.header_title',
    message: 'Help',
  });
  return (
    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={pageTitle}
      contentTitle={pageTitle}
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
            message: 'Expand your knowledge',
          })}
          icon={<GraduateCapIcon />}
          onPress={() => linkingRef.current?.openURL(LEATHER_LEARN_URL)}
        />
      </SettingsList>
    </AnimatedHeaderScreenLayout>
  );
}
