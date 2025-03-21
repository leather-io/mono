import { HTMLStyledProps, styled } from 'leather-styles/jsx';
import { getUiPackageAssetUrl } from '~/helpers/utils';

interface StacksIconProps extends HTMLStyledProps<'img'> {
  size?: number;
}
export function StacksIcon({ size = 24 }: StacksIconProps) {
  return <styled.img width={size} height={size} src={getUiPackageAssetUrl('icons/stacks.svg')} />;
}
