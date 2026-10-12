import { useLocation, useNavigate } from 'react-router';

import GenericError from '@assets/images/generic-error.png';
import { Flex, styled } from 'leather-styles/jsx';
import get from 'lodash.get';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

function getStateMessage(state: unknown) {
  if (
    typeof state === 'object' &&
    state !== null &&
    'message' in state &&
    typeof state.message === 'string'
  )
    return state.message;
  return '';
}

export function BroadcastErrorSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const message = getStateMessage(location.state);
  const proposeMode = Boolean(get(location.state, 'proposeMode', false));
  const action = proposeMode ? 'propose' : 'broadcast';

  return (
    <Sheet
      isShowing
      header={<SheetHeader />}
      onClose={() => void navigate('..')}
      footer={
        <Button fullWidth onClick={() => void navigate('..')} mt="space.05">
          Close
        </Button>
      }
    >
      <Flex
        flexDirection="column"
        justifyContent="center"
        mx="space.06"
        mb="space.02"
        position="relative"
        textAlign="center"
        minHeight="30vh"
      >
        <styled.img src={GenericError} width="106px" height="72px" m="0 auto" />
        <styled.h1 mt="space.05" textStyle="heading.05">
          Unable to {action} transaction
        </styled.h1>
        <styled.span mt="space.03" px="space.04" textStyle="body.01">
          Your transaction failed to {action}{' '}
          {message && <>because of the error: {message.toLowerCase()}</>}
        </styled.span>
      </Flex>
    </Sheet>
  );
}
