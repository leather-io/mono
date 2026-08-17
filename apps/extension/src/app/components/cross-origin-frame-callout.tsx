import { Callout, type CalloutProps } from '@leather.io/ui';

import { isCrossOriginFrameRequest } from '@shared/utils/cross-origin-frame';
import { getHostnameFromUrl } from '@shared/utils/urls';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';

function getDisplayHostname(origin: string) {
  try {
    return getHostnameFromUrl(origin);
  } catch {
    return origin;
  }
}

function getWarningBody(frameHostname: string, topOrigin: string | null) {
  if (!topOrigin)
    return `This request comes from ${frameHostname}, an app embedded in another website. Only continue if you trust ${frameHostname}.`;
  const topHostname = getDisplayHostname(topOrigin);
  return `This request comes from ${frameHostname}, an app embedded in ${topHostname} — not from ${topHostname} itself. Only continue if you trust ${frameHostname}.`;
}

export function CrossOriginFrameCallout(props: CalloutProps) {
  const { origin, topOrigin, frameId } = useDefaultRequestParams();

  if (!origin) return null;
  if (!isCrossOriginFrameRequest({ origin, topOrigin, frameId })) return null;

  const frameHostname = getDisplayHostname(origin);

  return (
    <Callout
      data-testid="cross-origin-frame-callout"
      variant="warning"
      title="Be careful with this embedded app"
      {...props}
    >
      {getWarningBody(frameHostname, topOrigin)}
    </Callout>
  );
}
