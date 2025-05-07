import { Flex, FlexProps } from 'leather-styles/jsx';

export function StackingFormStepsPanel(props: FlexProps) {
  return (
    <Flex
      flexDirection="column"
      position="sticky"
      width={[null, null, '244px', '320px']}
      top="124px"
      {...props}
    />
  );
}
