import { ReactNode } from 'react';

import { Box } from '../box/box.native';
import { Text, TextProps } from '../text/text.native';

interface SheetHeaderProps {
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
  bottomElement?: ReactNode;
}

export function SheetHeader({
  leftElement,
  centerElement,
  rightElement,
  bottomElement,
}: SheetHeaderProps) {
  return (
    <Box
      justifyContent="center"
      width="100%"
      bg="ink.background-primary"
      pt="3"
      borderTopLeftRadius="lg"
      borderTopRightRadius="lg"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        height={64}
        px="5"
      >
        <Box flexGrow={1}>{leftElement}</Box>
        <Box
          alignItems="center"
          justifyContent="center"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
        >
          {centerElement}
        </Box>
        <Box>{rightElement}</Box>
      </Box>
      {bottomElement}
    </Box>
  );
}

export function SheetTitle(props: TextProps) {
  return <Text variant="heading05" color="ink.text-primary" {...props} />;
}
