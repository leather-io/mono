import { useSelector } from 'react-redux';

import get from 'lodash.get';

import { Sheet, SheetHeader } from '@leather.io/ui';
import { isError } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { useLocation, useNavigate } from '@app/routes/compat';
import type { RootState } from '@app/store';

import { BroadcastErrorLayout } from './components/broadcast-error.layout';

interface Props {
  showInSheet?: boolean;
}

function getErrorMessage(error: unknown): string | undefined {
  if (isError(error)) return error.message;
  return undefined;
}

export function BroadcastError({ showInSheet = false }: Props) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reduxError = useSelector((s: RootState) => s.navigation.send.error);

  const msg = getErrorMessage(reduxError) ?? get(state, 'error.message', 'Unknown error response');
  const title = get(state, 'title', 'There was an error broadcasting your transaction');
  const body = get(state, 'body', 'Unable to broadcast transaction');

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
        onClose={() => navigate(RouteUrls.Home)}
      >
        {layout}
      </Sheet>
    );
  }

  return layout;
}
