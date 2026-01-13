import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import get from 'lodash.get';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';

import { BroadcastErrorLayout } from './components/broadcast-error.layout';
import { parseBroadcastError } from './parse-broadcast-error';

interface Props {
  showInSheet?: boolean;
}

export function BroadcastError({ showInSheet = false }: Props) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const rawErrorMessage =
    get(state, 'message') || get(state, 'error.message') || 'Unknown error response';

  const parsedError = useMemo(() => parseBroadcastError(rawErrorMessage), [rawErrorMessage]);

  const title = get(state, 'title') || parsedError.title;
  const body = get(state, 'body') || parsedError.body;

  useOnMount(() => analytics.track('bitcoin_contract_error', { msg: rawErrorMessage }));

  const layout = (
    <BroadcastErrorLayout
      my="space.05"
      textAlign="center"
      errorPayload={rawErrorMessage}
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
