import { styled } from 'leather-styles/jsx';

interface DetailsPillButtonProps {
  label: string;
  onClick(): void;
  disabled?: boolean;
  testId?: string;
}

export function DetailsPillButton({ label, onClick, disabled, testId }: DetailsPillButtonProps) {
  return (
    <styled.button
      type="button"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      px="space.03"
      py="space.02"
      height="36px"
      flex="1"
      bg="ink.background-primary"
      border="default"
      borderRadius="999px"
      textStyle="label.02"
      color={disabled ? 'ink.text-subdued' : 'ink.text-primary'}
      opacity={disabled ? 0.6 : 1}
      _hover={disabled ? undefined : { bg: 'ink.component-background-hover', cursor: 'pointer' }}
      onClick={disabled ? undefined : onClick}
      data-testid={testId}
    >
      {label}
    </styled.button>
  );
}
