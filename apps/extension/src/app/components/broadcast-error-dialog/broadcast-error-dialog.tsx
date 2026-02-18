import { useSelector } from 'react-redux';

import GenericError from '@assets/images/generic-error.png';
import { Flex, styled } from 'leather-styles/jsx';

import { Button, Sheet, SheetHeader } from '@leather.io/ui';

import { useNavigate } from '@app/routes/compat';
import type { RootState } from '@app/store';

export function BroadcastErrorSheet() {
  const navigate = useNavigate();
  const message = useSelector(
    (state: RootState) => state.navigation.misc.errorState?.message ?? ''
  );

  return (
    <Sheet
      isShowing
      header={<SheetHeader />}
      onClose={() => navigate('..')}
      footer={
        <Button fullWidth onClick={() => navigate('..')} mt="space.05">
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
          Unable to broadcast transaction
        </styled.h1>
        <styled.span mt="space.03" px="space.04" textStyle="body.01">
          Your transaction failed to broadcast{' '}
          {message && <>because of the error: {message.toLowerCase()}</>}
        </styled.span>
      </Flex>
    </Sheet>
  );
}
