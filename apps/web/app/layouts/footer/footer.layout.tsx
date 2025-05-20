import {
  Flex,
  type FlexProps,
  Grid,
  type GridProps,
  type HTMLStyledProps,
  VStack,
  styled,
} from 'leather-styles/jsx';
import { ExternalLink } from '~/components/external-link';

import { Flag, FlagProps, LeatherLettermarkIcon } from '@leather.io/ui';

export function FooterLayout(props: HTMLStyledProps<'footer'>) {
  return (
    <styled.footer
      px="space.07"
      pb="space.05"
      backgroundColor="ink.background-secondary"
      borderTop="default"
      {...props}
    />
  );
}

function FooterGrid(props: GridProps) {
  return (
    <Grid
      gap={['space.07', 'space.07', 'space.09']}
      gridTemplateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(4, 1fr)']}
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
        <styled.h4 textStyle="label.02" mb="space.03" whiteSpace="nowrap">
          {title}
        </styled.h4>
        <VStack alignItems="flex-start" gap="space.03" whiteSpace="nowrap">
          {children}
        </VStack>
      </Flex>
    </Flex>
  );
}

interface FooterLegalTextProps extends FlagProps {
  product: string;
  copyright: string;
}
function FooterLegalText({ product, copyright, ...props }: FooterLegalTextProps) {
  return (
    <Flag spacing="space.05" img={<LeatherLettermarkIcon />} {...props}>
      <Flex flexDir="column" textStyle="caption.01" fontSize="12px" color="ink.text-subdued">
        <styled.span>{product}</styled.span>
        <styled.span>{copyright}</styled.span>
      </Flex>
    </Flag>
  );
}

FooterLayout.Grid = FooterGrid;
FooterLayout.Column = FooterColumn;
FooterLayout.Link = ExternalLink;
FooterLayout.LegalText = FooterLegalText;
FooterLayout.LeatherIcon = FooterLeatherIcon;
