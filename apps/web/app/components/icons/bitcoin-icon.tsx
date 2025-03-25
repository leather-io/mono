import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface BitcoinIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function BitcoinIcon({ size = 24 }: BitcoinIconProps) {
  return <styled.img width={size} height={size} src="icons/bitcoin.svg" />;
}
