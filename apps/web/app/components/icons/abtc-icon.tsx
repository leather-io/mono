import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { ImageSizeProps } from '~/utils/types';

export function AbtcLogo(props: HTMLStyledProps<'img'> & ImageSizeProps) {
  return (
    <styled.img
      width={props.size ?? props.width}
      height={props.size ?? props.height}
      src="icons/abtc.svg"
      alt="aBTC Logo"
      {...props}
    />
  );
}
