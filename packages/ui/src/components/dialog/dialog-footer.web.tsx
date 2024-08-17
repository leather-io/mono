import { Flex, FlexProps } from 'leather-styles/jsx';

interface DialogFooterProps extends FlexProps {
  children: React.ReactNode;
}

export function DialogFooter({ children, ...props }: DialogFooterProps) {
  return (
    <Flex
      gap="space.05"
      p="space.05"
      bottom={0}
      width="100vw"
      maxWidth="100%"
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
