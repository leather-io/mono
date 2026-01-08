import { ClarityType } from '@stacks/transactions';
import { Box, BoxProps, Flex, FlexProps } from 'leather-styles/jsx';

interface TupleDisplayerProps extends BoxProps {
  isRoot: boolean;
}
export function TupleDisplayer({ isRoot, ...rest }: TupleDisplayerProps) {
  const marginLeft = isRoot ? 0 : 'space.04';
  return (
    <Box
      ml={marginLeft}
      overflow="visible"
      flex={isRoot ? '1 100%' : undefined}
      pt={isRoot ? '12px' : undefined}
      fontFamily={isRoot ? 'Fira Code' : undefined}
      {...rest}
    />
  );
}

interface TupleNodeDisplayerProps {
  clarityType: ClarityType;
  children: React.ReactNode;
}
export function TupleNodeDisplayer({ clarityType, ...props }: TupleNodeDisplayerProps) {
  return clarityType === ClarityType.Tuple ? <Box {...props} /> : <Flex {...props} />;
}
export function TupleNodeLabelDisplayer(props: BoxProps) {
  return <Box mr="space.04" color="ink.text-subdued" {...props} />;
}

export function TupleNodeValueDisplayer(props: FlexProps) {
  return <Flex wordWrap="break-word" whiteSpace="pre-line" {...props} />;
}
