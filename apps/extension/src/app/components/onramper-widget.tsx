import { Stack } from 'leather-styles/jsx';

import { Button, Callout, LoadingSpinner } from '@leather.io/ui';

import { ONRAMPER_WIDGET_HOST } from '@shared/environment';

import { useOnramperWidgetSignatureQuery } from '@app/query/onramper/onramper-widget-signature.query';

const widgetHeight = '585px';

interface OnramperWidgetProps {
  params: Record<string, string>;
}

export function OnramperWidget({ params }: OnramperWidgetProps) {
  const { data: signature, isError, isFetching, refetch } = useOnramperWidgetSignatureQuery(params);

  if (isError) {
    return (
      <Stack gap="space.05" width="100%">
        <Callout variant="error" title="Couldn't load checkout">
          Something went wrong while preparing the checkout. Try again in a moment.
        </Callout>
        <Button aria-busy={isFetching} onClick={() => void refetch()}>
          Try again
        </Button>
      </Stack>
    );
  }

  if (!signature) return <LoadingSpinner height={widgetHeight} />;

  return (
    <iframe
      title="Onramper Widget"
      height={widgetHeight}
      width="100%"
      allow="popups; accelerometer; autoplay; camera; gyroscope; payment; microphone"
      src={`${ONRAMPER_WIDGET_HOST}?${new URLSearchParams({ ...params, ...signature }).toString()}`}
    />
  );
}
