import { AppListing } from '@/features/browser/browser/app-listing';
import { t } from '@lingui/macro';

export default function ConnectionsScreen() {
  return (
    <AppListing
      appStatus="connected"
      title={t({ id: 'browser.connections.title', message: 'Connections' })}
      emptyStateTitle={t({
        id: 'browser-sheet.connected.empty.caption',
        message: 'You will find the apps you are connected to here',
      })}
      imageSrc={require('@/assets/stickers/ufo.png')}
    />
  );
}
