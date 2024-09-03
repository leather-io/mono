import { ResponsiveValue, useTheme } from '@shopify/restyle';

import {
  Box,
  IconProps,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

import { MODAL_HEADER_HEIGHT } from './constants';

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
    <Box alignItems="center" flexDirection="row" height={MODAL_HEADER_HEIGHT}>
      <Box alignItems="flex-start" flex={2}>
        <Box alignItems="center" flexDirection="row" gap="3">
          <Box
            bg={getIconBackgroundColor(modalVariant)}
            borderRadius="round"
            flexDirection="row"
            p="2"
          >
            <Icon color={theme.colors[getIconColor(modalVariant)]} />
          </Box>
          <Text color="ink.text-primary" variant="heading05">
            {title}
          </Text>
        </Box>
      </Box>
      <Box alignItems="flex-end" flex={1}>
        <TouchableOpacity onPress={onPressSupport} zIndex={10}>
          <QuestionCircleIcon variant="small" />
        </TouchableOpacity>
      </Box>
    </Box>
  );
}
