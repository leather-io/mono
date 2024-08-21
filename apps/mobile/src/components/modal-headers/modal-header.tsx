import { ResponsiveValue, useTheme } from '@shopify/restyle';

import {
  Box,
  IconProps,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

type ModalHeaderVariant = 'normal' | 'critical';

function getIconBackgroundColor(
  modalVariant: ModalHeaderVariant
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (modalVariant) {
    case 'normal':
      return 'ink.background-secondary';
    case 'critical':
      return 'red.background-primary';
  }
}

function getIconColor(
  modalVariant: ModalHeaderVariant
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (modalVariant) {
    case 'normal':
      return 'ink.text-primary';
    case 'critical':
      return 'red.action-primary-default';
  }
}

export function ModalHeader({
  title,
  Icon,
  modalVariant,
  onPressSupport,
}: {
  title: string;
  Icon: React.FC<IconProps>;
  modalVariant: ModalHeaderVariant;
  onPressSupport?(): unknown;
}) {
  const theme = useTheme<Theme>();
  return (
    <Box gap="3" flexDirection="row" alignItems="center">
      {onPressSupport && (
        <TouchableOpacity
          onPress={onPressSupport}
          p="5"
          right={-12}
          top={-12}
          zIndex={10}
          position="absolute"
        >
          <QuestionCircleIcon variant="small" />
        </TouchableOpacity>
      )}
      <Box borderRadius="round" p="2" bg={getIconBackgroundColor(modalVariant)}>
        <Icon color={theme.colors[getIconColor(modalVariant)]} />
      </Box>
      <Text variant="heading05">{title}</Text>
    </Box>
  );
}
