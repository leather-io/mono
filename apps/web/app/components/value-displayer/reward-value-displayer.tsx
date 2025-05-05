import { ReactNode } from 'react';

import { Flex, FlexProps, styled } from 'leather-styles/jsx';

interface ValueDisplayerProps extends FlexProps {
  children: ReactNode;
}
export function ValueDisplayerBase({ children }: ValueDisplayerProps) {
  return (
    <Flex flex={1} flexDir="column" justifyContent="space-between" p="space.05">
      {children}
    </Flex>
  );
}

interface ValueDisplayerValueProps {
  value: ReactNode;
}
function ValueDisplayerValue({ value }: ValueDisplayerValueProps) {
  return <styled.span textStyle="label.01">{value}</styled.span>;
}

interface ValueDisplayerNameProps {
  name: ReactNode;
}
function ValueDisplayerName({ name }: ValueDisplayerNameProps) {
  return (
    <styled.h4 color="ink.text-subdued" textStyle="label.03">
      {name}
    </styled.h4>
  );
}

ValueDisplayerBase.Value = ValueDisplayerValue;
ValueDisplayerBase.Name = ValueDisplayerName;
