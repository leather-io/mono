import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface LiStxIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function LiStxIcon({ size = 20 }: LiStxIconProps) {
  return <styled.img width={size} height={size} src="/icons/listx.svg" />;
}
