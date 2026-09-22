import { UpdateAvailableSelectors } from '@tests/selectors/update-available.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import { InternalMethods } from '@shared/message-types';
import { sendMessage } from '@shared/messages';
import { analytics } from '@shared/utils/analytics';

import { initialSearchParams } from '@app/common/initial-search-params';
import { useAccountGateDestination } from '@app/routes/account-gate';
import { useDismissMessage } from '@app/store/settings/settings.actions';
import { useDismissedMessageIds } from '@app/store/settings/settings.selectors';
import { useHasSoftwareWallets } from '@app/store/software-keys/software-key.selectors';

import {
  makeUpdateAvailableMessageId,
  selectShouldShowUpdateCallout,
} from './update-available.utils';
import { usePendingUpdateVersion } from './use-pending-update-version';

const passwordWalletUpdateCopy =
  'Updating locks your wallet, now or the next time you relaunch your browser.';
const passwordlessWalletUpdateCopy = 'It installs the next time you relaunch your browser.';

interface UpdateAvailableCalloutLayoutProps {
  body: string;
  onUpdateNow(): void;
  onUpdateLater(): void;
}
function UpdateAvailableCalloutLayout({
  body,
  onUpdateNow,
  onUpdateLater,
}: UpdateAvailableCalloutLayoutProps) {
  return (
    <Box
      role="status"
      data-testid={UpdateAvailableSelectors.UpdateAvailableCallout}
      bg="ink.component-background-default"
      borderBottomWidth="1px"
      borderBottomColor="ink.border-default"
      flexShrink={0}
    >
      <Flex
        direction="column"
        gap="space.02"
        alignItems="flex-start"
        maxWidth="fullPageMaxWidth"
        mx="auto"
        py="space.04"
        px="space.05"
        color="ink.text-primary"
        width="100%"
      >
        <styled.span textStyle="label.02">New version available</styled.span>
        <styled.span textStyle="caption.01">{body}</styled.span>
        <Flex gap="space.04">
          <styled.button
            type="button"
            textStyle="label.03"
            textDecoration="underline"
            _hover={{ cursor: 'pointer' }}
            onClick={onUpdateNow}
            data-testid={UpdateAvailableSelectors.UpdateAvailableCalloutUpdateNow}
          >
            Update now
          </styled.button>
          <styled.button
            type="button"
            textStyle="label.03"
            textDecoration="underline"
            _hover={{ cursor: 'pointer' }}
            onClick={onUpdateLater}
            data-testid={UpdateAvailableSelectors.UpdateAvailableCalloutLater}
          >
            Later
          </styled.button>
        </Flex>
      </Flex>
    </Box>
  );
}

export function UpdateAvailableCallout() {
  const pendingVersion = usePendingUpdateVersion();
  const dismissMessage = useDismissMessage();
  const dismissedMessageIds = useDismissedMessageIds();
  const accountGateDestination = useAccountGateDestination();
  const hasSoftwareWallets = useHasSoftwareWallets();

  const shouldShow = selectShouldShowUpdateCallout({
    pendingVersion,
    currentVersion: VERSION,
    isRequestWindow: initialSearchParams.has('origin'),
    isWalletReady: accountGateDestination === null,
    dismissedMessageIds,
  });

  if (!shouldShow || !pendingVersion) return null;

  return (
    <UpdateAvailableCalloutLayout
      body={hasSoftwareWallets ? passwordWalletUpdateCopy : passwordlessWalletUpdateCopy}
      onUpdateNow={() => {
        analytics.track('update_available_callout_update_now');
        void sendMessage({ method: InternalMethods.ApplyPendingUpdate, payload: undefined });
      }}
      onUpdateLater={() => {
        analytics.track('update_available_callout_later');
        dismissMessage(makeUpdateAvailableMessageId(pendingVersion));
      }}
    />
  );
}
