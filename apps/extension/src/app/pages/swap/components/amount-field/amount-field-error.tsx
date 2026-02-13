import { styled } from 'leather-styles/jsx';

interface AmountFieldErrorProps {
  message: string;
}

export function AmountFieldError({ message }: AmountFieldErrorProps) {
  return (
    <styled.span textStyle="label.02" color="red.action-primary-default" role="alert">
      {message}
    </styled.span>
  );
}
