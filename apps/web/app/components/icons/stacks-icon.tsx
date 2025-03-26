import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface StacksIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function StacksIcon({ size = 20 }: StacksIconProps) {
  return <styled.img width={size} height={size} src="icons/stacks.svg" />;
}
