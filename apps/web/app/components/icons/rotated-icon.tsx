import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export function RotatedArrow(props: HTMLStyledProps<'span'>) {
  return (
    <styled.span ml="space.01" display="inline-block" transform="rotate(45deg)" {...props}>
      ↑
    </styled.span>
  );
}
