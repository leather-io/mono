import { useNavigate } from 'react-router';

import GenericError from '@assets/images/generic-error.png';
import { Flex, styled } from 'leather-styles/jsx';
import { z } from 'zod';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useRouteState } from '@app/common/hooks/use-route-state';

const broadcastErrorSheetRouteStateSchema = z
  .object({
    message: z.string().optional(),
    proposeMode: z.boolean().optional(),
  })
  .catch({});

export function BroadcastErrorSheet() {
  const navigate = useNavigate();
  const { message, proposeMode } = useRouteState(broadcastErrorSheetRouteStateSchema);
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
