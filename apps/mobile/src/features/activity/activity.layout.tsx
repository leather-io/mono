import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { PageLayout } from '@/components/page/page.layout';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { HasChildren } from '@leather.io/ui/native';

import { NetworkBadge } from '../settings/network-badge';

function getTitle(accountName?: string) {
  return accountName
    ? t({
        id: 'activity.account.header_title',
        message: 'Activity',
      })
    : t({
        id: 'activity.header_title',
        message: 'All activity',
      });
}

function getContentTitle(accountName?: string) {
  return accountName
    ? i18n._({
        id: 'activity.account.header_content_title',
        message: '{accountName} Activity',
        values: { accountName: accountName },
      })
    : t({
        id: 'activity.header_title',
        message: 'All activity',
      });
}

interface ActivityLayoutProps extends HasChildren {
  accountName?: string;
}
export function ActivityLayout({ children, accountName }: ActivityLayoutProps) {
  return (
    <PageLayout scrollable={false}>
      <AnimatedHeaderScreenLayout
        contentContainerStyles={{ paddingHorizontal: 0 }}
        rightHeaderElement={<NetworkBadge />}
        title={getTitle(accountName)}
        subtitle={accountName ? accountName : undefined}
        contentTitle={getContentTitle(accountName)}
        contentTitleStyles={{ paddingLeft: '5' }}
        scrollable={false} // TODO: ENG-37 - remove this once the header is implemented - cannot mix animated header with FlatList
      >
        {children}
      </AnimatedHeaderScreenLayout>
    </PageLayout>
  );
}
