import { useNavigate } from 'react-router';

import { z } from 'zod';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useRouteState } from '@app/common/hooks/use-route-state';

import { BroadcastErrorLayout } from './components/broadcast-error.layout';

interface Props {
  showInSheet?: boolean;
}

const broadcastErrorRouteStateSchema = z
  .object({
    error: z.object({ message: z.string() }).optional().catch(undefined),
    proposeMode: z.boolean().optional(),
  })
  .catch({});

export function BroadcastError({ showInSheet = false }: Props) {
  const { error, proposeMode } = useRouteState(broadcastErrorRouteStateSchema);
  const navigate = useNavigate();

  const msg = error?.message ?? 'Unknown error response';
  const title = proposeMode
    ? 'There was an error proposing your transaction'
    : 'There was an error broadcasting your transaction';
  const body = proposeMode ? 'Unable to propose transaction' : 'Unable to broadcast transaction';

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
