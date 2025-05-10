import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface StStxIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function StStxIcon({ size = 20 }: StStxIconProps) {
  return <styled.img width={size} height={size} src="icons/ststx.svg" />;
}
