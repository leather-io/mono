import { RpcErrorCode, createRpcErrorResponse } from '@leather.io/rpc';

import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { analytics } from '@shared/utils/analytics';

import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { useOnMount } from '@app/common/hooks/use-on-mount';
import { initialSearchParams } from '@app/common/initial-search-params';
import { capitalize } from '@app/common/utils';
import { GenericError, GenericErrorListItem } from '@app/components/generic-error/generic-error';

type MessageSigningChain = 'bitcoin' | 'stacks';

function createMissingAccountErrorResponse(chain: MessageSigningChain, requestId: string) {
  const error = {
    code: RpcErrorCode.METHOD_NOT_SUPPORTED,
    message: `Leather does not have a ${capitalize(chain)} account for this wallet. Add your ${capitalize(chain)} account in Leather, then retry the request.`,
  };
  if (chain === 'bitcoin') return createRpcErrorResponse('signMessage', { id: requestId, error });
  if (initialSearchParams.get('messageType') === 'structured')
    return createRpcErrorResponse('stx_signStructuredMessage', { id: requestId, error });
  return createRpcErrorResponse('stx_signMessage', { id: requestId, error });
}

interface SignMessageMissingAccountErrorProps {
  chain: MessageSigningChain;
}
export function SignMessageMissingAccountError({ chain }: SignMessageMissingAccountErrorProps) {
  const { frameId, tabId } = useDefaultRequestParams();
  const requestId = initialSearchParams.get('requestId');
  const chainName = capitalize(chain);

  useOnMount(() => {
    analytics.track('request_signature_cannot_sign_message_no_account');
    if (!tabId || !requestId) return;
    void sendMessageToOriginatingFrame(
      { frameId, tabId },
      createMissingAccountErrorResponse(chain, requestId)
    );
  });

  return (
    <GenericError
      data-testid="sign-message-missing-account-error"
      body={`This app asked Leather to sign a message with your ${chainName} account, but it hasn't been added to this wallet yet`}
      helpTextList={[
        <GenericErrorListItem
          key="connect"
          text={`Open Leather and select "Connect ${chainName}" on the homepage`}
        />,
        <GenericErrorListItem
          key="ledger"
          text={`Connect your Ledger device with the ${chainName} app open and follow the steps`}
        />,
        <GenericErrorListItem key="retry" text="Return to the app and retry your request" />,
      ]}
      title={`${chainName} account not found`}
    />
  );
}
