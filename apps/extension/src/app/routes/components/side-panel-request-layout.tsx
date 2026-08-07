import { Outlet, useOutletContext } from 'react-router';

import { css } from 'leather-styles/css';
import { Flex } from 'leather-styles/jsx';

import { isSidePanelPage } from '@shared/utils/side-panel';

import type { ReceiveOutletContext } from '@app/common/receive/receive';
import type { SwitchAccountOutletContext } from '@app/common/switch-account/switch-account';

type SidePanelRequestOutletContext = ReceiveOutletContext & SwitchAccountOutletContext;

export function SidePanelRequestLayout() {
  const context = useOutletContext<SidePanelRequestOutletContext>();

  if (!isSidePanelPage()) return <Outlet context={context} />;
  return (
    <Flex
      flexDirection="column"
      flexGrow={1}
      width="100%"
      backgroundColor="ink.background-primary"
      animation="fadein 180ms ease-out"
      _motionReduce={{ animation: 'none' }}
      className={css({
        '--leather-colors-ink-background-secondary': 'var(--leather-colors-ink-background-primary)',
      })}
    >
      <Outlet context={context} />
    </Flex>
  );
}
