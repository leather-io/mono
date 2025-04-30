import { getHintUtils } from '@epic-web/client-hints';
import { clientHint as colourSchemeHint } from '@epic-web/client-hints/color-scheme';
import { useRequestInfo } from '~/utils/request-info';

const hintsUtils = getHintUtils({ theme: colourSchemeHint });

export function ClientHintCheck() {
  return (
    <script
      dangerouslySetInnerHTML={{
        // Utility to send client state hints to server
        __html: hintsUtils.getClientHintCheckScript(),
      }}
    />
  );
}

export const { getHints } = hintsUtils;

export function useHints() {
  const requestInfo = useRequestInfo();
  return requestInfo.hints;
}
