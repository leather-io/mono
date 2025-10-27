import { Text } from '@leather.io/ui/native';

interface ErrorMessageProps {
  message: string;
}

export function AmountFieldError({ message }: ErrorMessageProps) {
  return (
    <Text variant="label02" color="red.action-primary-default" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}
