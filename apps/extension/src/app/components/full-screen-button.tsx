import { useLocation } from 'react-router';

import { ExpandIcon, IconButton, Tooltip } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';
import { closeSidePanel } from '@shared/utils/side-panel';

import { whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';

const nonInvasiveExplainerHoverDelay = 850;

export function FullScreenButton() {
  const location = useLocation();

  if (window.location.pathname.includes('/popup.html')) return null;

  return whenPageMode({
    full: null,
    popup: (
      <Tooltip.Root delayDuration={nonInvasiveExplainerHoverDelay}>
        <Tooltip.Trigger>
          <IconButton
            aria-label="Open in full screen"
            icon={<ExpandIcon />}
            _hover={{ bg: 'ink.component-background-hover' }}
            _focusVisible={{ outline: 'none' }}
            height="40px"
            p="space.02"
            onClick={async () => {
              analytics.untypedTrack('click_open_in_new_tab', {
                location: 'header',
              });
              void analytics.identify(undefined, { hasVisitedFullPageMode: true });
              await openIndexPageInNewTab(location.pathname);
              // Leaves one wallet on screen rather than the full page and the
              // sidebar side by side. No-ops outside the side panel.
              void closeSidePanel();
            }}
          >
            <ExpandIcon />
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Content side="left">
          <Tooltip.Arrow />
          Open in full screen
        </Tooltip.Content>
      </Tooltip.Root>
    ),
  });
}
