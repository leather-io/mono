import { Box, Flex, styled } from 'leather-styles/jsx';

import { CopyAddress } from '../../../multisig/components/copy-address';
import { VariantSwitcher, useActiveVariant } from '../../components/variant-switcher';
import { BoardSection } from './board-section';
import { sampleAddresses } from './content-rendering.data';

const typographyVariants = [
  { id: 'current', label: 'Current sidebar scale' },
  { id: 'parity', label: 'Center-column parity' },
];

// Token pairs per variant. The issue's named experiment: try the default
// size used for equivalent center-column items (e.g. vault members) in the
// sidebar and compare. Both variants stay on design-system font-size tokens.
const scaleByVariant = {
  current: { label: 'label.03', body: 'caption.01', address: 'caption.01' },
  parity: { label: 'label.02', body: 'body.02', address: 'caption.01' },
} as const;

function isScaleId(id: string): id is keyof typeof scaleByVariant {
  return id in scaleByVariant;
}

function SidebarSample({ scale }: { scale: (typeof scaleByVariant)[keyof typeof scaleByVariant] }) {
  return (
    <Flex
      direction="column"
      gap="space.03"
      width="280px"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-transparent"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Sidebar · account details
      </styled.span>
      <Flex direction="column" gap="space.01">
        <styled.span textStyle={scale.label} color="ink.text-primary">
          Operating account
        </styled.span>
        <styled.span textStyle={scale.body} color="ink.text-subdued">
          2 of 3 signatures required
        </styled.span>
        <Box textStyle={scale.address}>
          <CopyAddress addr={sampleAddresses.multisig} />
        </Box>
      </Flex>
    </Flex>
  );
}

function CenterSample() {
  return (
    <Flex
      direction="column"
      gap="space.03"
      flex="1"
      minWidth="280px"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-transparent"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Center column · vault member (reference, unchanged)
      </styled.span>
      <Flex direction="column" gap="space.01">
        <styled.span textStyle="label.02" color="ink.text-primary">
          Amber
        </styled.span>
        <styled.span textStyle="body.02" color="ink.text-subdued">
          Joined · signer
        </styled.span>
        <CopyAddress addr={sampleAddresses.member} />
      </Flex>
    </Flex>
  );
}

export function TypographyBoard() {
  const active = useActiveVariant(typographyVariants, 'type');
  const scale = isScaleId(active.id) ? scaleByVariant[active.id] : scaleByVariant.current;

  return (
    <BoardSection
      title="Sidebar typography scale"
      description="The sidebar is intentionally a step below the center column — but the concrete sizes need another look. Left card switches; right card is the center-column reference it should sit against."
    >
      <Flex direction="column" gap="space.03">
        <VariantSwitcher variants={typographyVariants} param="type" />
        <Flex gap="space.04" flexWrap="wrap">
          <SidebarSample scale={scale} />
          <CenterSample />
        </Flex>
      </Flex>
    </BoardSection>
  );
}
