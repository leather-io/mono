import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { PageLayout } from '@/components/page/page.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';

import { Pressable, Text } from '@leather.io/ui/native';

export function ActivityLayout() {
  return (
    // <PageLayout>
    //   <Pressable>
    //     <Text>Activity</Text>
    //   </Pressable>
    // </PageLayout>

    <AnimatedHeaderScreenLayout
      rightHeaderElement={<NetworkBadge />}
      title={t({
        id: 'activity.header_title',
        message: 'Activity',
      })}
    >
      <Text>Activity</Text>
    </AnimatedHeaderScreenLayout>
  );
}
