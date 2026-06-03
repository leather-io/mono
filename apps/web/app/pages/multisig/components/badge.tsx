import { Flex, styled } from 'leather-styles/jsx';

export type BadgeVariant = 'default' | 'error' | 'info' | 'success' | 'warning';

interface BadgeColors {
  bg: string;
  borderColor: string;
  color: string;
}

const badgeColors: Record<BadgeVariant, BadgeColors> = {
  default: {
    bg: 'ink.background-secondary',
    borderColor: 'ink.border-transparent',
    color: 'ink.text-subdued',
  },
  error: {
    bg: 'red.background-primary',
    borderColor: 'red.border',
    color: 'red.action-primary-default',
  },
  info: {
    bg: 'blue.background-primary',
    borderColor: 'blue.border',
    color: 'blue.action-primary-default',
  },
  success: {
    bg: 'green.background-primary',
    borderColor: 'green.border',
    color: 'green.action-primary-default',
  },
  warning: {
    bg: 'yellow.background-primary',
    borderColor: 'yellow.border',
    color: 'yellow.action-primary-default',
  },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  outlined?: boolean;
}

export function Badge({ label, variant = 'default', outlined }: BadgeProps) {
  const colors = badgeColors[variant];
  const showDot = variant !== 'default';
  return (
    <Flex
      alignItems="center"
      width="fit-content"
      height="16px"
      gap="space.01"
      pl={showDot ? 'space.01' : 'space.02'}
      pr="space.02"
      borderRadius="round"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={colors.borderColor}
      bg={outlined ? 'transparent' : colors.bg}
      color={colors.color}
      textStyle="label.03"
      fontSize="11px"
    >
      {showDot && (
        <styled.span
          aria-hidden
          width="6px"
          height="6px"
          flexShrink={0}
          borderRadius="round"
          bg="currentColor"
        />
      )}
      <styled.span>{label}</styled.span>
    </Flex>
  );
}
