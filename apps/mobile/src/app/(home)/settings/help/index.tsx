import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/components/network-badge';
import { t } from '@lingui/macro';

import { Cell, GraduateCapIcon, MagicBookIcon, SupportIcon } from '@leather.io/ui/native';

export default function SettingsHelpScreen() {
  return (
    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={t({
        id: 'help.header_title',
        message: 'Help',
      })}
    >
      <Cell.Root
        title={t({
          id: 'help.support.cell_title',
          message: 'Support and feedback',
        })}
        caption={t({
          id: 'help.support.cell_caption',
          message: 'Placeholder',
        })}
        icon={<SupportIcon />}
        onPress={() => {}}
      >
        <Cell.Chevron />
      </Cell.Root>
      <Cell.Root
        title={t({
          id: 'help.guides.cell_title',
          message: 'Guides',
        })}
        caption={t({
          id: 'help.guides.cell_caption',
          message: 'Placeholder',
        })}
        icon={<MagicBookIcon />}
        onPress={() => {}}
      >
        <Cell.Chevron />
      </Cell.Root>
      <Cell.Root
        title={t({
          id: 'help.learn.cell_title',
          message: 'Learn',
        })}
        caption={t({
          id: 'help.learn.cell_caption',
          message: 'Placeholder',
        })}
        icon={<GraduateCapIcon />}
        onPress={() => {}}
      >
        <Cell.Chevron />
      </Cell.Root>
    </AnimatedHeaderScreenLayout>
  );
}
