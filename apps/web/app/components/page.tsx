import { css } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

const insetPageMarginX = css({ mx: '-space.07' });

export function Page(props: HTMLStyledProps<'div'>) {
  return <styled.div mx="space.07" {...props} />;
}

interface PageHeaderProps {
  title: React.ReactNode;
}
function PageHeader({ title }: PageHeaderProps) {
  return (
    <styled.header
      className={insetPageMarginX}
      display="flex"
      h="60px"
      borderBottom="default"
      alignItems="center"
    >
      <styled.h1 textStyle="heading.04" mx="space.05">
        {title}
      </styled.h1>
    </styled.header>
  );
}

function PageDivider(props: HTMLStyledProps<'hr'>) {
  return (
    <styled.hr
      className={insetPageMarginX}
      color="ink.background-primary"
      borderBottom="default"
      {...props}
    />
  );
}

Page.Header = PageHeader;
Page.Divider = PageDivider;
