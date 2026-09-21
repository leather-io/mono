import { HStack, styled } from 'leather-styles/jsx';

import { Favicon } from '@app/components/favicon';

interface ActivityRequesterProps {
  origin: string;
}

export function ActivityRequester({ origin }: ActivityRequesterProps) {
  return (
    <HStack gap="space.02" alignItems="center">
      <Favicon origin={origin} />
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {`Requested by ${origin}`}
      </styled.span>
    </HStack>
  );
}
