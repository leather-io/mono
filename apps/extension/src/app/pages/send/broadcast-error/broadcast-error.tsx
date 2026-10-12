import { useLocation, useNavigate } from 'react-router';

import get from 'lodash.get';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { readRouteStateString } from '@app/pages/read-route-state';

import { BroadcastErrorLayout } from './components/broadcast-error.layout';

interface Props {
  showInSheet?: boolean;
}

export function BroadcastError({ showInSheet = false }: Props) {
  const location = useLocation();
  const state: unknown = location.state;
  const navigate = useNavigate();

  const msg = readRouteStateString(state, 'error.message', 'Unknown error response');
  const proposeModeValue: unknown = get(state, 'proposeMode', false);
  const proposeMode = Boolean(proposeModeValue);
  const title = readRouteStateString(
    state,
    'title',
    proposeMode
      ? 'There was an error proposing your transaction'
      : 'There was an error broadcasting your transaction'
  );
  const body = readRouteStateString(
    state,
    'body',
    proposeMode ? 'Unable to propose transaction' : 'Unable to broadcast transaction'
  );

  useOnMount(() => analytics.track('bitcoin_contract_error', { msg }));

  const layout = (
    <BroadcastErrorLayout
      my="space.05"
      textAlign="center"
      errorPayload={msg}
      title={title}
      body={body}
    />
  );

  if (showInSheet) {
    return (
      <Sheet
        header={<SheetHeader title="Error" />}
        isShowing
        onClose={() => void navigate(RouteUrls.Home)}
      >
        {layout}
      </Sheet>
    );
  }

  return layout;
}
