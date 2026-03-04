import { Flex, FlexProps, styled } from 'leather-styles/jsx';

interface SelectTriggerProps extends FlexProps {
  label: string;
}
export function SelectTrigger({ label, children, ...props }: SelectTriggerProps) {
  return (
    <Flex
      flexDir="column"
      alignItems="flex-start"
      border="default"
      borderRadius="xs"
      width="100%"
      {...props}
    >
      <styled.strong textStyle="label.03" color="ink.text-subdued-secondary">
        {label}
      </styled.strong>
      <styled.p textStyle="label.02">{children}</styled.p>
    </Flex>
  );
}
