import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export function RotatedArrow(props: HTMLStyledProps<'span'>) {
  return (
    <styled.span display="inline-block" transform="rotate(45deg)" {...props}>
      ↑
    </styled.span>
  );
}
