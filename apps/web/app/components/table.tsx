import { css } from 'leather-styles/css';
import { HTMLStyledProps, styled } from 'leather-styles/jsx';

export const theadBorderBottom = css({
  _after: {
    content: '""',
    display: 'block',
    pos: 'absolute',
    width: '100%',
    left: 0,
    height: '1px',
    bg: 'ink.border-default',
  },
});

export function SortableHeader(props: HTMLStyledProps<'div'>) {
  return <styled.div _hover={{ textDecoration: 'underline' }} {...props} />;
}
