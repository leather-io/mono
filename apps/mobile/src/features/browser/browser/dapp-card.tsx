import { ReactNode } from 'react';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

interface DappCardProps {
  title: string;
  caption: string;
  image: ReactNode;
  onPress(): void;
}

export function DappCard({ image, title, caption, onPress }: DappCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      p="4"
      borderRadius="lg"
      borderWidth={1}
      borderColor="ink.border-default"
    >
      <Box pb="5">{image}</Box>
      <Text variant="label02" pb="1">
        {title}
      </Text>
      <Text variant="caption01">{caption}</Text>
    </TouchableOpacity>
  );
}
