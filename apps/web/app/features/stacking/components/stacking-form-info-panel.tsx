import { Flex, FlexProps } from 'leather-styles/jsx';

export function StackingFormInfoPanel(props: FlexProps) {
  return (
    <Flex
      flexDirection="column"
      position="sticky"
      minWidth={[null, null, '360px', '420px']}
      top="124px"
      {...props}
    />
  );
}
