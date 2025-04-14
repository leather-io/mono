import { Flex, FlexProps } from 'leather-styles/jsx';

export function StackingFormStepsPanel(props: FlexProps) {
  return (
    <Flex
      flexDirection="column"
      position="sticky"
      minWidth={[null, null, '220px', '420px']}
      top="124px"
      {...props}
    />
  );
}
