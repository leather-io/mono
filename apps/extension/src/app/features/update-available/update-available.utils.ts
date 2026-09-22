import { compare } from 'compare-versions';

const updateAvailableMessageIdPrefix = 'update-available';

export function makeUpdateAvailableMessageId(version: string) {
  return `${updateAvailableMessageIdPrefix}-${version}`;
}

function isNewerVersion(pendingVersion: string, currentVersion: string) {
  try {
    return compare(pendingVersion, currentVersion, '>');
  } catch {
    return false;
  }
}

interface ShouldShowUpdateCalloutArgs {
  pendingVersion: string | null;
  currentVersion: string;
  isRequestWindow: boolean;
  isWalletReady: boolean;
  dismissedMessageIds: string[];
}
export function selectShouldShowUpdateCallout({
  pendingVersion,
  currentVersion,
  isRequestWindow,
  isWalletReady,
  dismissedMessageIds,
}: ShouldShowUpdateCalloutArgs) {
  if (!pendingVersion) return false;
  if (!isNewerVersion(pendingVersion, currentVersion)) return false;
  if (isRequestWindow) return false;
  if (!isWalletReady) return false;
  return !dismissedMessageIds.includes(makeUpdateAvailableMessageId(pendingVersion));
}
