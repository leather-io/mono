import { Box, Flex, styled } from 'leather-styles/jsx';

import { CopyAddress } from '../../../multisig/components/copy-address';
import { VariantSwitcher, useActiveVariant } from '../../components/variant-switcher';
import { BoardSection } from './board-section';
import { sampleAddresses } from './content-rendering.data';

const addressVariants = [
  { id: 'truncated', label: 'Always truncated' },
  { id: 'full', label: 'Always full' },
  { id: 'adaptive', label: 'Adaptive (full when it fits)' },
];

const containerWidths = ['520px', '360px', '220px'];

// Adaptive here means: render the full address where the container has room
// (preferable for security — e.g. signer rows with nothing on the right) and
// fall back to middle-truncation when tight. This first pass approximates
// "fits" with a width threshold per container; a real implementation would
// measure. Copy always copies the full address regardless of display.
function AddressCell({ width, variant }: { width: string; variant: string }) {
  const fitsFull = parseInt(width, 10) >= 480;
  const showFull = variant === 'full' || (variant === 'adaptive' && fitsFull);

  return (
    <Flex
      alignItems="center"
      width={width}
      maxWidth="100%"
      px="space.03"
      py="space.02"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-transparent"
    >
      <Box minWidth={0}>
        <CopyAddress addr={sampleAddresses.multisig} full={showFull} />
      </Box>
    </Flex>
  );
}

export function AddressesBoard() {
  const active = useActiveVariant(addressVariants, 'addr');

  return (
    <BoardSection
      title="Address display"
      description="One address rendered into three container widths. Copy always copies the full address. Activity's 'Sent to' should use this same code-font component instead of the default sans."
    >
      <Flex direction="column" gap="space.03">
        <VariantSwitcher variants={addressVariants} param="addr" />
        <Flex direction="column" gap="space.02" alignItems="flex-start">
          {containerWidths.map(width => (
            <AddressCell key={width} width={width} variant={active.id} />
          ))}
        </Flex>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Widths: 520px (signer row, nothing on the right) · 360px (sidebar) · 220px (tight cell)
        </styled.span>
      </Flex>
    </BoardSection>
  );
}
