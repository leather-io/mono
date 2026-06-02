import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';

const StyledLink = styled(Link);

interface MultisigErrorStateProps {
  title?: string;
  body?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

// Shared soft empty/not-found surface. Styled as a calm empty state, not an
// alarm — in a design preview the common case is "this id isn't in the current
// session", a navigational dead end rather than a failure.
export function MultisigErrorState({
  title = 'Not in this session',
  body,
  backTo = '/multisig',
  backLabel = 'Back to Multisig',
}: MultisigErrorStateProps) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      gap="space.03"
      py="space.10"
    >
      <styled.h3 textStyle="heading.05">{title}</styled.h3>
      {body && (
        <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="380px">
          {body}
        </styled.p>
      )}
      <StyledLink to={backTo} textStyle="label.02" color="ink.action-primary-default">
        {backLabel}
      </StyledLink>
    </Flex>
  );
}
