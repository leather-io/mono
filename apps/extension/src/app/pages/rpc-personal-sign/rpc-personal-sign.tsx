import { Box, Flex, styled } from 'leather-styles/jsx';

import { Flag } from '@leather.io/ui';

import { PopupHeader } from '@app/features/container/headers/popup.header';

import { useRpcPersonalSign, useRpcPersonalSignParams } from './use-rpc-personal-sign';
import { RpcPersonalSignActions } from './rpc-personal-sign-actions';

export function RpcPersonalSign() {
  const { requestId, tabId, origin, siwsParams, message } = useRpcPersonalSignParams();
  const { isLoading, signMessage, onCancelPersonalSign } = useRpcPersonalSign();

  if (!requestId || !tabId || !origin || !siwsParams) return null;

  return (
    <>
      <PopupHeader showSwitchAccount balance="stx" />
      <Box p="space.05" pb="space.06">
        <Flex flexDirection="column" gap="space.04">
          <styled.h1 textStyle="heading.03">Sign in with Stacks</styled.h1>

          <Flag img={<>🌐</>} spacing="space.03">
            <styled.span textStyle="label.02">{origin}</styled.span>
          </Flag>

          <Box
            border="default"
            borderRadius="xs"
            p="space.04"
            bg="ink.background-primary"
            maxHeight="300px"
            overflowY="auto"
          >
            <Flex flexDirection="column" gap="space.03">
              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Domain
                </styled.div>
                <styled.div textStyle="label.02" wordBreak="break-all">
                  {siwsParams.domain}
                </styled.div>
              </Box>

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Address
                </styled.div>
                <styled.div textStyle="label.02" fontFamily="mono" wordBreak="break-all">
                  {siwsParams.address}
                </styled.div>
              </Box>

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  URI
                </styled.div>
                <styled.div textStyle="label.02" wordBreak="break-all">
                  {siwsParams.uri}
                </styled.div>
              </Box>

              {siwsParams.statement && (
                <Box>
                  <styled.div textStyle="label.03" color="ink.text-subdued">
                    Statement
                  </styled.div>
                  <styled.div textStyle="label.02">{siwsParams.statement}</styled.div>
                </Box>
              )}

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Chain ID
                </styled.div>
                <styled.div textStyle="label.02">{siwsParams.chainId}</styled.div>
              </Box>

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Nonce
                </styled.div>
                <styled.div textStyle="label.02" fontFamily="mono">
                  {siwsParams.nonce}
                </styled.div>
              </Box>

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Issued At
                </styled.div>
                <styled.div textStyle="label.02">{siwsParams.issuedAt}</styled.div>
              </Box>

              {siwsParams.expirationTime && (
                <Box>
                  <styled.div textStyle="label.03" color="ink.text-subdued">
                    Expiration Time
                  </styled.div>
                  <styled.div textStyle="label.02">{siwsParams.expirationTime}</styled.div>
                </Box>
              )}

              {siwsParams.notBefore && (
                <Box>
                  <styled.div textStyle="label.03" color="ink.text-subdued">
                    Not Before
                  </styled.div>
                  <styled.div textStyle="label.02">{siwsParams.notBefore}</styled.div>
                </Box>
              )}

              <Box>
                <styled.div textStyle="label.03" color="ink.text-subdued">
                  Request ID
                </styled.div>
                <styled.div textStyle="label.02" fontFamily="mono">
                  {siwsParams.requestId}
                </styled.div>
              </Box>

              {siwsParams.resources && siwsParams.resources.length > 0 && (
                <Box>
                  <styled.div textStyle="label.03" color="ink.text-subdued">
                    Resources
                  </styled.div>
                  <Flex flexDirection="column" gap="space.02">
                    {siwsParams.resources.map((resource, index) => (
                      <styled.div key={index} textStyle="label.02" wordBreak="break-all">
                        {resource}
                      </styled.div>
                    ))}
                  </Flex>
                </Box>
              )}
            </Flex>
          </Box>

          <RpcPersonalSignActions
            isLoading={isLoading}
            onApprove={() => signMessage({ message, messageType: 'utf8' })}
            onCancel={onCancelPersonalSign}
          />
        </Flex>
      </Box>
    </>
  );
}
