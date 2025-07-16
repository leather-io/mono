import { AppListing } from '@/features/browser/browser/app-listing';
import { t } from '@lingui/macro';

export default function RecentlyViewedScreen() {
  return (
    <AppListing
      appStatus="recently_visited"
      title={t({ id: 'browser.recently-viewed.title', message: 'Recently viewed' })}
      emptyStateTitle={t({
        id: 'browser-sheet.recent.empty.caption',
        message: 'You will find the apps you recently viewed here',
      })}
      imageSrc={require('@/assets/stickers/flower.png')}
    />
  );
}
