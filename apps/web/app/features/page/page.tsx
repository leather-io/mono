import { css } from 'leather-styles/css';
import { Box, Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';
import { Link, Hr } from '@leather.io/ui';
import { content } from '~/data/content';

import { SignInButton } from '../sign-in-button/sign-in-button';

export const insetPageMarginX = css({ mx: ['-space.04', '-space.05', '-space.07'] });

export function Page(props: HTMLStyledProps<'div'>) {
  return <styled.div mx={['space.04', 'space.05', 'space.07']} {...props} />;
}

export function PageInset(props: HTMLStyledProps<'div'>) {
  return <styled.div className={insetPageMarginX} {...props} />;
}

interface PageHeadingProps {
  title: string;
  subtitle: string;
  disclaimer: string;
  postSlug?: string;
}
export function PageHeading({ title, subtitle, disclaimer, postSlug }: PageHeadingProps) {
  const needsPeriod = subtitle && !subtitle.endsWith('.') && !subtitle.endsWith('!') && !subtitle.endsWith('?');
  
  const learnMoreLink = postSlug ? (
    <>
      {subtitle && needsPeriod ? '. ' : ' '}
      <Link href={`https://leather.io/posts/${postSlug}`} target="_blank" rel="noopener">
        Learn more
      </Link>
    </>
  ) : null;

  return (
    <Flex my="space.07" flexDir={['column', 'column', 'row']} gap={[null, null, 'space.08']}>
      <Box flex={1}>
        <Page.Title textStyle="heading.03" maxW="400px">
          {title}
        </Page.Title>
      </Box>
      <Box flex={1}>
        <Page.Subtitle mt={['space.03', 'space.03', 0]}>
          {subtitle}
          {learnMoreLink}
        </Page.Subtitle>
        
        {disclaimer && (
          <>
            <Hr my="space.03" />
            <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.02">
              ⚠️ {disclaimer}
            </styled.div>
          </>
        )}
      </Box>
    </Flex>
  );
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
      <styled.h1 textStyle="heading.05" mx={['space.04', 'space.05', 'space.07']}>
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

export function PageTitle({ ...props }: HTMLStyledProps<'h2'>) {
  return <styled.h2 textStyle="heading.03" {...props} />;
}

export function PageSubtitle({ ...props }: HTMLStyledProps<'h3'>) {
  return <styled.h3 textStyle="label.01" {...props} />;
}

Page.Divider = PageDivider;
Page.Header = PageHeader;
Page.Heading = PageHeading;
Page.Title = PageTitle;
Page.Subtitle = PageSubtitle;
Page.Inset = PageInset;
