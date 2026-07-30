import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

import { Box, Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { MockModeToggle } from '~/components/mock-mode-toggle';
import { WhenClient } from '~/components/when-client';
import { SignInButton } from '~/features/sign-in-button/sign-in-button';
import { useSignInSlot } from '~/layouts/page/sign-in-slot';
import { getPostHref } from '~/utils/post-link';

import { ArrowLeftIcon, Button, Link } from '@leather.io/ui';

export function Page(props: HTMLStyledProps<'div'>) {
  return <styled.div {...props} />;
}

interface PageHeadingProps {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}
function PageHeading({ title, subtitle, children }: PageHeadingProps) {
  return (
    <Flex my="space.07" flexDir={['column', 'column', 'row']} gap={[null, null, 'space.08']}>
      <Box flex={1}>
        <Page.Title textStyle="heading.02" maxW="400px">
          {title}
        </Page.Title>
      </Box>
      <Box flex={1}>
        {subtitle && (
          <Page.Subtitle mt={['space.03', 'space.03', 0]} whiteSpace="pre-line">
            {subtitle}
          </Page.Subtitle>
        )}
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
}

export function LearnMoreLink({ destination }: LearnMoreLinkProps) {
  if (!destination) return null;

  // Simple URL check
  const isUrl = /^https?:\/\//.test(destination);
  const href = isUrl ? destination : getPostHref(destination);
  return (
    <styled.span>
      {' '}
      <Link href={href} style={{ fontSize: 'inherit', display: 'inline', whiteSpace: 'nowrap' }}>
        Learn more
      </Link>
    </styled.span>
  );
}

interface PageHeaderProps {
  title?: React.ReactNode;
  backTo?: string;
  onBack?(): void;
  children?: React.ReactElement | React.ReactElement[];
}
function PageHeader({ title, backTo, onBack, children }: PageHeaderProps) {
  const signInSlot = useSignInSlot();
  const backButton = (
    <Button variant="ghost" size="sm" iconStart={ArrowLeftIcon} width="32px" px="0" gap="0" />
  );
  return (
    <styled.header display="flex" justifyContent="space-between" h="60px" alignItems="center">
      <Flex alignItems="center" justifyContent="space-between" flex={1}>
        <Flex alignItems="center" gap="space.02" minWidth={0}>
          {onBack ? (
            <styled.button type="button" onClick={onBack} aria-label="Back" bg="transparent">
              {backButton}
            </styled.button>
          ) : (
            backTo && (
              <RouterLink to={backTo} aria-label="Back">
                {backButton}
              </RouterLink>
            )
          )}
          {title && <styled.h1 textStyle="heading.05">{title}</styled.h1>}
        </Flex>
        <MockModeToggle />
        {children}
      </Flex>
      <WhenClient>
        <Flex maxW="fit-content" height="100%">
          {signInSlot ?? <SignInButton />}
        </Flex>
      </WhenClient>
    </styled.header>
  );
}

function PageDivider(props: HTMLStyledProps<'hr'>) {
  return <styled.hr color="ink.background-primary" borderBottom="default" {...props} />;
}

function PageTitle({ ...props }: HTMLStyledProps<'h2'>) {
  return <styled.h2 textStyle="heading.02" {...props} />;
}

function PageSubtitle({ ...props }: HTMLStyledProps<'h3'>) {
  return <styled.h3 textStyle="label.01" {...props} />;
}

Page.Divider = PageDivider;
Page.Header = PageHeader;
Page.Heading = PageHeading;
Page.Title = PageTitle;
Page.Subtitle = PageSubtitle;
