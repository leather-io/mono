import { ReactElement } from 'react';

import { Avatar, Box, ItemLayout, Pressable } from '@leather.io/ui/native';

interface BaseFeeOptionProps {
  onPress(): void;
  isSelected: boolean;
  disabled: boolean;
  icon: ReactElement;
  title: string;
  time: string;
  formattedFeeAmount: string;
  formattedFiatFeeAmount: string;
}

export function BaseFeeOption({
  onPress,
  isSelected,
  disabled,
  icon,
  title,
  time,
  formattedFeeAmount,
  formattedFiatFeeAmount,
}: BaseFeeOptionProps) {
  return (
    <>
      <Pressable
        borderColor={isSelected ? 'ink.text-primary' : 'ink.border-default'}
        borderWidth={1}
        borderRadius="xs"
        flexDirection="row"
        alignItems="center"
        p="3"
        gap="3"
        onPress={onPress}
        disabled={disabled}
      >
        <Avatar icon={icon} />
        <ItemLayout
          titleLeft={title}
          captionLeft={time}
          titleRight={formattedFeeAmount}
          captionRight={formattedFiatFeeAmount}
        />
        {disabled && (
          <Box
            top={0}
            bottom={0}
            right={0}
            left={0}
            position="absolute"
            backgroundColor="ink.background-overlay"
            opacity={0.1}
          />
        )}
      </Pressable>
    </>
  );
}
