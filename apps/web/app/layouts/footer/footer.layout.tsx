import {
  Box,
  BoxProps,
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
      gridTemplateColumns={['repeat(2, 1fr)', null, null, 'repeat(4, 1fr)']}
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
        color="ink.text-subdued-secondary"
        mt="space.04"
      >
        <styled.span>{product}</styled.span>
        <styled.span>{copyright}</styled.span>
      </Flex>
    </Box>
  );
}

FooterLayout.Grid = FooterGrid;
FooterLayout.Column = FooterColumn;
FooterLayout.Link = ExternalLink;
FooterLayout.LegalText = FooterLegalText;
FooterLayout.LeatherIcon = FooterLeatherIcon;
