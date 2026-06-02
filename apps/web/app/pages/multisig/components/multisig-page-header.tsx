import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

const StyledLink = styled(Link);

interface MultisigPageHeaderProps {
  title: ReactNode;
  // Explicit parent route for back navigation (a Link, not history -1, so
  // direct-URL entry works for reviewers). Omit on top-level screens.
  backTo?: string;
  backLabel?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function MultisigPageHeader({
  title,
  backTo,
  backLabel = 'Back',
  icon,
  actions,
}: MultisigPageHeaderProps) {
  return (
    <Flex direction="column" gap="space.03" mb="space.05">
      {backTo && (
        <StyledLink
          to={backTo}
          width="fit-content"
          textStyle="label.03"
          color="ink.text-subdued"
          _hover={{ color: 'ink.text-primary' }}
        >
          ← {backLabel}
        </StyledLink>
      )}
      <Flex alignItems="center" justifyContent="space-between" gap="space.04" flexWrap="wrap">
        <Flex alignItems="center" gap="space.03" minWidth={0}>
          {icon}
          <styled.h2 textStyle="heading.04">{title}</styled.h2>
        </Flex>
        {actions && (
          <Flex alignItems="center" gap="space.02">
            {actions}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
