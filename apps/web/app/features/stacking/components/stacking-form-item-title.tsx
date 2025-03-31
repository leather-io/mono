import { HStack, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

interface StackingFormItemTitleProps {
  title: string;
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title } = props;
  return (
    <HStack gap="space.02">
      <styled.h1 textStyle="label.01">{title}</styled.h1>
      <InfoCircleIcon color="ink.text-subdued" width="16px" height="16px" />
    </HStack>
  );
}
