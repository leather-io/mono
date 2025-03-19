import { BoxProps, styled } from 'leather-styles/jsx';

type TitleProps = BoxProps;

export function Title({ children, ...props }: TitleProps) {
  return (
    <styled.h1 textStyle="heading.03" color="ink.text-primary" mb="space.04" {...props}>
      {children}
    </styled.h1>
  );
}
