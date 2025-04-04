import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { ImageSizeProps } from '~/utils/types';

export function BitflowLogo(props: HTMLStyledProps<'img'> & ImageSizeProps) {
  return (
    <styled.img
      width={props.size ?? props.width}
      height={props.size ?? props.height}
      src="icons/bitflow.png"
      alt="Bitflow Logo"
      {...props}
    />
  );
}
