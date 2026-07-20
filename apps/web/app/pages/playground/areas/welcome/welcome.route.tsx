import { Box, Flex, styled } from 'leather-styles/jsx';

import { VariantSwitcher, useActiveVariant } from '../../components/variant-switcher';

const densityVariants = [
  { id: 'current', label: 'Current' },
  { id: 'roomy', label: 'Roomy' },
  { id: 'compact', label: 'Compact' },
];

const densityStyles = {
  current: { padding: 'space.04', gap: 'space.03' },
  roomy: { padding: 'space.06', gap: 'space.04' },
  compact: { padding: 'space.03', gap: 'space.02' },
} as const;

function isDensityId(id: string): id is keyof typeof densityStyles {
  return id in densityStyles;
}

// Demonstrates the area anatomy on a toy example: one board, three variants,
// active variant linkable via ?v=. Real areas swap the toy card for real
// components rendering mock data.
function DensityDemoBoard() {
  const active = useActiveVariant(densityVariants);
  const density = isDensityId(active.id) ? densityStyles[active.id] : densityStyles.current;

  return (
    <Flex direction="column" gap="space.03">
      <VariantSwitcher variants={densityVariants} />
      <Flex
        direction="column"
        gap={density.gap}
        p={density.padding}
        maxWidth="400px"
        borderRadius="md"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="ink.border-transparent"
      >
        <styled.span textStyle="label.01" color="ink.text-primary">
          Sample card
        </styled.span>
        <styled.span textStyle="body.02" color="ink.text-subdued">
          The switcher above changes this card&apos;s spacing. Copy the URL — the active variant
          travels with it.
        </styled.span>
      </Flex>
    </Flex>
  );
}

export default function WelcomeRoute() {
  return (
    <Flex direction="column" gap="space.06" maxWidth="720px" p="space.06">
      <Box>
        <styled.h1 textStyle="heading.04" color="ink.text-primary">
          How the playground works
        </styled.h1>
        <styled.p textStyle="body.01" color="ink.text-subdued" mt="space.02">
          One persistent canvas, organized into areas. An area covers one design topic or issue and
          holds switchable variants of the surfaces under review, rendered with real components and
          mock data. Exploration areas are deleted once their winning variant ships; living areas
          (like this one) stay as reference.
        </styled.p>
      </Box>
      <DensityDemoBoard />
      <styled.p textStyle="caption.01" color="ink.text-subdued">
        Adding an area: folder under areas/, one route entry in playground.routes.ts, one entry in
        playground-areas.ts. See the README in pages/playground.
      </styled.p>
    </Flex>
  );
}
