import { Flex, FlexProps } from 'leather-styles/jsx';

interface SheetFooterProps extends FlexProps {
  children: React.ReactNode;
}

export function SheetFooter({ children, ...props }: SheetFooterProps) {
  return (
    <Flex
      gap="space.05"
      p="space.05"
      bottom={0}
      width="100%"
      zIndex={1}
      minHeight="footerHeight"
      position="fixed"
      borderBottomRadius="md"
      bg="ink.background-primary"
      borderTop="default"
      {...props}
    >
      {children}
    </Flex>
  );
}
