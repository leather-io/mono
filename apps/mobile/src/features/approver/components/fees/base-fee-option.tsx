import { ReactElement } from 'react';

import { Avatar, ItemLayout, Pressable } from '@leather.io/ui/native';

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
  const borderColor = {
    default: isSelected ? 'ink.text-primary' : 'ink.border-default',
    pressed: 'ink.action-primary-hover',
  } as const;

  return (
    <>
      <Pressable
        borderColor={borderColor.default}
        borderWidth={1}
        borderRadius="xs"
        flexDirection="row"
        alignItems="center"
        p="3"
        gap="3"
        onPress={onPress}
        disabled={disabled}
        opacity={disabled ? 0.5 : 1}
        pressEffects={{
          borderColor: {
            from: borderColor.default,
            to: borderColor.pressed,
            settings: { type: 'timing' },
          },
        }}
      >
        <Avatar icon={icon} />
        <ItemLayout
          titleLeft={title}
          captionLeft={time}
          titleRight={formattedFeeAmount}
          captionRight={formattedFiatFeeAmount}
        />
      </Pressable>
    </>
  );
}
