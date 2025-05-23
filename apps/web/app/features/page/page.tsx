import { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/client-only';
import { getPostHref } from '~/utils/post-link';

import { Link } from '@leather.io/ui';

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
  subtitle?: ReactNode;
  children?: ReactNode;
}
export function PageHeading({ title, subtitle = '', children }: PageHeadingProps) {
  return (
    <Flex my="space.07" flexDir={['column', 'column', 'row']} gap={[null, null, 'space.08']}>
      <Box width="50%">
        <Page.Title textStyle="heading.02" maxW="400px">
          {title}
        </Page.Title>
      </Box>
      <Box width="50%">
        <Page.Subtitle mt={['space.03', 'space.03', 0]} style={{ whiteSpace: 'pre-line' }}>
          {subtitle}
        </Page.Subtitle>
        {children}
      </Box>
    </Flex>
  );
}

/**
 * destination: can be a postSlug (string) or a full URL (string starting with http/https)
 * precedingText: text that comes before the link, used for punctuation logic
 */
interface LearnMoreLinkProps {
  destination: string;
  precedingText?: string;
}
export function LearnMoreLink({ destination, precedingText }: LearnMoreLinkProps) {
  if (!destination) return null;
  const needsPeriod =
    precedingText &&
    !precedingText.trim().endsWith('.') &&
    !precedingText.trim().endsWith('!') &&
    !precedingText.trim().endsWith('?');
  // Simple URL check
  const isUrl = /^https?:\/\//.test(destination);
  const href = isUrl ? destination : getPostHref(destination);
  return (
    <styled.span>
      {precedingText && needsPeriod ? '. ' : ' '}
      <Link href={href} style={{ fontSize: 'inherit', display: 'inline' }}>
        {'Learn more'}
      </Link>
    </styled.span>
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
