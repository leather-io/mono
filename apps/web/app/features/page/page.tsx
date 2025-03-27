import { css } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';

import { SignInButton } from '../sign-in-button/sign-in-button';

export const insetPageMarginX = css({ mx: '-space.07' });

export function Page(props: HTMLStyledProps<'div'>) {
  return <styled.div mx="space.07" {...props} />;
}

interface PageHeaderProps {
  title: React.ReactNode;
}
export function PageHeader({ title }: PageHeaderProps) {
  return (
    <styled.header
      className={insetPageMarginX}
      display="flex"
      justifyContent="space-between"
      h="60px"
      borderBottom="default"
      alignItems="center"
    >
      <styled.h1 textStyle="heading.04" mx="space.05">
        {title}
      </styled.h1>

      <WhenClient>
        <SignInButton />
      </WhenClient>
    </styled.header>
  );
}

export function PageDivider(props: HTMLStyledProps<'hr'>) {
  return (
    <styled.hr
      className={insetPageMarginX}
      color="ink.background-primary"
      borderBottom="default"
      {...props}
    />
  );
}

Page.Divider = PageDivider;
Page.Header = PageHeader;
