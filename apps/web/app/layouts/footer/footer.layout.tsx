import { Link } from 'react-router';

import {
  Box,
  type BoxProps,
  Flex,
  type FlexProps,
  Grid,
  type GridProps,
  type HTMLStyledProps,
  VStack,
  styled,
} from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';

import { LeatherLettermarkIcon } from '@leather.io/ui';

export function FooterLayout(props: HTMLStyledProps<'footer'>) {
  return <styled.footer pb="space.05" {...props} />;
}

function FooterGrid(props: GridProps) {
  return (
    <Grid
      width="100%"
      gap={['space.07', 'space.07', 'space.09']}
      gridTemplateColumns={['repeat(2, 1fr)', null, null, 'repeat(3, 1fr)']}
      mt="space.07"
      {...props}
    />
  );
}

function FooterLeatherIcon() {
  return <LeatherLettermarkIcon variant="small" />;
}

interface FooterColumnProps extends FlexProps {
  title: string;
}
function FooterColumn({ title, children, ...props }: FooterColumnProps) {
  return (
    <Flex>
      <Flex flexDir="column" {...props}>
        <styled.h4 textStyle="heading.05" mb="space.03" whiteSpace="nowrap">
          {title}
        </styled.h4>
        <VStack alignItems="flex-start" gap="space.03" whiteSpace="nowrap">
          {children}
        </VStack>
      </Flex>
    </Flex>
  );
}

interface FooterLegalTextProps extends BoxProps {
  product: string;
  copyright: string;
}
function FooterLegalText({ product, copyright, ...props }: FooterLegalTextProps) {
  return (
    <Box {...props}>
      <LeatherLettermarkIcon />
      <Flex
        flexDir="column"
        textStyle="caption.01"
        fontSize="12px"
        color="ink.text-subdued"
        mt="space.04"
      >
        <styled.span>{copyright}</styled.span>
        <styled.span>{product}</styled.span>
      </Flex>
    </Box>
  );
}

const StyledRouterLink = styled(Link);

interface FooterInternalLinkProps extends Omit<HTMLStyledProps<'a'>, 'href'> {
  to: string;
}
/** Same look as FooterLayout.Link, for in-app routes (client-side navigation, same tab). */
function FooterInternalLink({ to, ...props }: FooterInternalLinkProps) {
  return (
    <StyledRouterLink
      to={to}
      prefetch="intent"
      textStyle="label.02"
      borderBottom="1px solid"
      borderColor="ink.border-default"
      _hover={{ borderColor: 'ink.action-primary-hover' }}
      _focus={{ borderColor: 'ink.action-primary-hover' }}
      outline={0}
      {...props}
    />
  );
}

FooterLayout.Grid = FooterGrid;
FooterLayout.InternalLink = FooterInternalLink;
FooterLayout.Column = FooterColumn;
FooterLayout.Link = ExternalLink;
FooterLayout.LegalText = FooterLegalText;
FooterLayout.LeatherIcon = FooterLeatherIcon;
