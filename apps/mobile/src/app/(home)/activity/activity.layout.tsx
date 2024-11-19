import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

export function ActivityLayout({ children }: HasChildren) {
  return (
    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={t({
        id: 'activity.header_title',
        message: 'Activity',
      })}
    >
      {children}
    </AnimatedHeaderScreenLayout>
  );
}
