import { Link } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.02"
      textStyle="label.03"
      color="ink.text-subdued"
      my="space.04"
    >
      {segments.map((segment, i) => (
        <Flex key={segment.label} alignItems="center" gap="space.02">
          {i > 0 && <styled.span aria-hidden>/</styled.span>}
          {segment.href ? (
            <Link to={segment.href}>
              <styled.span _hover={{ textDecoration: 'underline' }}>{segment.label}</styled.span>
            </Link>
          ) : (
            <styled.span color="ink.text-primary">{segment.label}</styled.span>
          )}
        </Flex>
      ))}
    </Flex>
  );
}
