import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';

import { HasChildren } from '@leather.io/ui/native';

import { ActivityFooter } from './components/activity-footer';

function getTitle(accountName?: string) {
  return accountName
    ? t({
        id: 'activity.account.header_title',
        message: 'Activity',
      })
    : t({
        id: 'activity.header_title',
        message: 'All Activity',
      });
}

function getContentTitle(accountName?: string) {
  return accountName
    ? t({
        id: 'activity.account.header__content_title',
        message: `${accountName} Activity`,
      })
    : t({
        id: 'activity.header_title',
        message: 'All Activity',
      });
}

interface ActivityLayoutProps extends HasChildren {
  accountName?: string;
}
export function ActivityLayout({ children, accountName }: ActivityLayoutProps) {
  return (
    <AnimatedHeaderScreenLayout
      contentContainerStyles={{ paddingHorizontal: 0 }}
      rightHeaderElement={<NetworkBadge />}
      title={getTitle(accountName)}
      subtitle={accountName ? accountName : undefined}
      contentTitle={getContentTitle(accountName)}
      contentTitleStyles={{ paddingLeft: '5' }}
    >
      {children}
      <ActivityFooter />
    </AnimatedHeaderScreenLayout>
  );
}
