import { type ReactNode } from 'react';

import { Flex, type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { MarketingTag } from '~/pages/marketing/shared/marketing-tag';

import { CheckmarkCircleIcon } from '@leather.io/ui';

/** Display-face section heading ("FULL CONTROL, / NO COMPROMISE."). Pass lines as an array. */
export function HomeSectionHeading({
  lines,
  ...props
}: { lines: string[] } & Omit<HTMLStyledProps<'h2'>, 'children'>) {
  return (
    <styled.h2 textStyle="heading.03" letterSpacing="0" {...props}>
      {lines.map((line, index) => (
        <styled.span key={line} display="block">
          {line}
          {index < lines.length - 1 ? ' ' : null}
        </styled.span>
      ))}
    </styled.h2>
  );
}

export function HomeSection(props: HTMLStyledProps<'section'>) {
  return <styled.section mt={['112px', null, '160px', '200px']} {...props} />;
}

/** Green check + label, used in the swaps provider list and the Ledger checklist. */
export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <styled.li
      display="flex"
      alignItems="flex-start"
      gap="space.02"
      textStyle="label.01"
      fontWeight="400"
    >
      <Flex flexShrink={0} height="24px" alignItems="center" aria-hidden>
        <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />
      </Flex>
      <styled.span color="ink.text-secondary">{children}</styled.span>
    </styled.li>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
  image: string;
  imageAlt: string;
  /** Visual aspect ratio (width / height). */
  imageAspect: string;
}

/** Grey card with a product visual on top and title (+ platform chip) and copy below. */
export function FeatureCard({
  title,
  description,
  tag,
  image,
  imageAlt,
  imageAspect,
}: FeatureCardProps) {
  return (
    <styled.article
      display="flex"
      flexDir="column"
      bg="ink.background-secondary"
      borderRadius="sm"
      overflow="hidden"
    >
      <styled.img
        src={image}
        alt={imageAlt}
        width="100%"
        height="auto"
        style={{ aspectRatio: imageAspect }}
        objectFit="cover"
        loading="lazy"
        decoding="async"
      />
      <styled.div
        px={['space.05', null, 'space.06']}
        pt="space.05"
        pb={['space.05', null, 'space.06']}
      >
        <Flex alignItems="center" gap="space.02" flexWrap="wrap">
          <styled.h3 textStyle="heading.05" fontWeight="400">
            {title}
          </styled.h3>
          {tag && <MarketingTag>{tag}</MarketingTag>}
        </Flex>
        <styled.p textStyle="body.02" lineHeight="24px" color="ink.text-secondary" mt="space.02">
          {description}
        </styled.p>
      </styled.div>
    </styled.article>
  );
}
