import { Flex, styled } from 'leather-styles/jsx';

import { AddressesBoard } from './addresses-board';
import { TypographyBoard } from './typography-board';
import { ValuesBoard } from './values-board';

// Exploration area for issue #2527: how content renders in the multisig app —
// type sizes, number formatting, and address display. One board per strand of
// the issue; each board's active variant is linkable via its own URL param.
export default function ContentRenderingRoute() {
  return (
    <Flex direction="column" gap="space.07" maxWidth="960px">
      <Flex direction="column" gap="space.01">
        <styled.h1 textStyle="heading.04" color="ink.text-primary">
          Typography, values &amp; addresses
        </styled.h1>
        <styled.a
          href="https://github.com/leather-io/mono/issues/2527"
          target="_blank"
          rel="noreferrer"
          textStyle="caption.01"
          color="ink.text-subdued"
          _hover={{ color: 'ink.text-primary' }}
        >
          Issue #2527 ↗
        </styled.a>
      </Flex>
      <TypographyBoard />
      <ValuesBoard />
      <AddressesBoard />
    </Flex>
  );
}
