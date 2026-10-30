// Fixture: the sketch page that composes the off-system pieces.
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';
import { BasicTooltip } from '~/components/tooltip/basic-tooltip';

import { AmountChip } from './amount-chip';
import { ConfirmButton } from './confirm-button';
import { InfoTooltip } from './info-tooltip';
import { PillButton } from './pill-button';

export function OffSystemSketchPage() {
  return (
    <Stack gap="space.05" p="space.06">
      <Box
        bg="#F2F2F2"
        borderWidth={1}
        borderColor={{ base: '#E4E4E4', _dark: '#433F3C' }}
        borderRadius="md"
        p="space.04"
      >
        <styled.h2 textStyle="heading.06">Send privately</styled.h2>
        <styled.p textStyle="body.02" color="ink.border-selected">
          Amounts are shielded before they leave your wallet.
        </styled.p>
      </Box>
      <Flex gap="13px">
        <AmountChip amount="0.01" selected onSelect={() => {}} />
        <AmountChip amount="0.05" selected={false} onSelect={() => {}} />
      </Flex>
      <styled.span color="#7A5CFA" textStyle="label.03">
        Private
      </styled.span>
      <InfoTooltip label="Shielded amounts are hidden on-chain">
        <styled.span>What is this?</styled.span>
      </InfoTooltip>
      <BasicTooltip label="Network fee">
        <styled.span>Fee</styled.span>
      </BasicTooltip>
      <PillButton compact>Preview</PillButton>
      <ConfirmButton>Send privately</ConfirmButton>
    </Stack>
  );
}
