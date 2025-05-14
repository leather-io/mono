import { ContentTitle } from '@/components/headers/components/content-title';
import { PageLayout } from '@/components/page/page.layout';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { Box, HasChildren } from '@leather.io/ui/native';

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

interface ActivityHeaderProps extends HasChildren {
  accountName?: string;
}
// TODO: LEA-2461 refactor AnimatedHeaderScreenLayout
// Removed from ActivityList to implement FlashList
const ActivityHeader = ({ accountName, children }: ActivityHeaderProps) => {
  return (
    <Box bg="ink.background-primary" flex={1}>
      <Box flexDirection="row" justifyContent="space-between" paddingBottom="5">
        <Box alignItems="flex-start" flex={1} maxWidth={320}>
          <ContentTitle title={getContentTitle(accountName)} paddingLeft="5" />
        </Box>
      </Box>
      {children}
    </Box>
  );
};

interface ActivityLayoutProps extends HasChildren {
  accountName?: string;
}
export function ActivityLayout({ children, accountName }: ActivityLayoutProps) {
  return (
    <PageLayout scrollable={false}>
      <ActivityHeader accountName={accountName}>{children}</ActivityHeader>
    </PageLayout>
  );
}
