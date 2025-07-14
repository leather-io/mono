import { Flex, styled } from 'leather-styles/jsx';

import { RpcRequests } from '@leather.io/rpc';
import { Button, CloseIcon, Flag, Sheet } from '@leather.io/ui';

interface MockLeatherDialogLayoutProps {
  payload: RpcRequests;
  response: any;
  onClose(): void;
  onResolve(): void;
  onReject(): void;
}
export function MockLeatherDialogLayout({
  payload,
  response,
  onClose,
  onResolve,
  onReject,
}: MockLeatherDialogLayoutProps) {
  return (
    <Sheet isShowing={!!payload} onClose={onClose}>
      <styled.div px="space.05" py="space.03">
        <Flag
          img={
            <Button variant="ghost" onClick={onClose}>
              <CloseIcon />
            </Button>
          }
          reverse
          width="100%"
        >
          <styled.h1 textStyle="heading.04">{payload.method}</styled.h1>
        </Flag>

        <styled.h2>Request</styled.h2>
        <styled.pre
          overflowX="auto"
          fontFamily="monospace"
          lineHeight={1.4}
          fontSize="12px"
          mt="space.02"
        >
          <styled.code>{JSON.stringify(payload, null, 2)}</styled.code>
        </styled.pre>

        <styled.h2>Response</styled.h2>
        <styled.pre
          overflowX="auto"
          fontFamily="monospace"
          lineHeight={1.4}
          fontSize="12px"
          mt="space.02"
        >
          <styled.code>{JSON.stringify(response, null, 2)}</styled.code>
        </styled.pre>

        <Flex mt="space.03">
          <Button
            width="132px"
            onClick={() => {
              onResolve();
              onClose();
            }}
          >
            Resolve
          </Button>
          <Button
            ml="space.04"
            variant="outline"
            width="132px"
            onClick={() => {
              onReject();
              onClose();
            }}
          >
            Reject
          </Button>
        </Flex>
      </styled.div>
    </Sheet>
  );
}
