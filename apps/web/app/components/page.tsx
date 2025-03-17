import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

export function Page(props: HTMLStyledProps<'div'>) {
  return <styled.div mx="space.07" {...props} />;
}
