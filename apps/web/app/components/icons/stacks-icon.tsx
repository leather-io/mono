import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface StacksIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function StacksIcon({ size = 24 }: StacksIconProps) {
  return (
    <styled.img
      width={size}
      height={size}
      src="node_modules/@leather.io/ui/dist-web/assets/icons/stacks.svg"
    />
  );
}
