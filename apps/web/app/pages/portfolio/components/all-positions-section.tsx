import { Box, Stack, styled } from 'leather-styles/jsx';

import { PositionRow } from './position-row';
import { ProtocolSection } from './protocol-section';
import { StackingCycleInfoBar } from './stacking-cycle-info-bar';
import { YieldPositionsEmpty } from './yield-positions-empty';
import {
  AssetIcon,
  mockYieldProtocols,
  ProtocolIcon,
  YieldProtocol,
} from './yield-positions-data';

interface AllPositionsSectionProps {
  isEmpty?: boolean;
  protocols?: YieldProtocol[];
  stackingCycleData?: {
    daysUntilNextCycle: number;
    totalStxStacked: string;
    totalValueStacked: string;
  };
}

function getPositionIconColor(positionType: string): string {
  switch (positionType) {
    case 'supplied':
      return '#22c55e';
    case 'borrowed':
      return '#12100f';
    case 'collateral':
      return '#f59300';
    case 'debt':
      return '#12100f';
    case 'position':
      return '#f59300';
    case 'pending':
      return '#12100f';
    default:
      return '#a1a1aa';
  }
}

export function AllPositionsSection({
  isEmpty = false,
  protocols = mockYieldProtocols,
  stackingCycleData,
}: AllPositionsSectionProps) {
  const hasPositions = !isEmpty && protocols.length > 0;

  return (
    <Stack gap="space.03" pt="space.07">
      <Box>
        <styled.h2 textStyle="heading.05" color="ink.text-primary">
          All positions
        </styled.h2>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          Protocol support and data accuracy may vary. We make every effort to display reliable
          information, but completeness isn't guaranteed.
        </styled.p>
      </Box>

      <Stack gap="space.05">
        {stackingCycleData && (
          <StackingCycleInfoBar
            daysUntilNextCycle={stackingCycleData.daysUntilNextCycle}
            totalStxStacked={stackingCycleData.totalStxStacked}
            totalValueStacked={stackingCycleData.totalValueStacked}
          />
        )}

        {!hasPositions && <YieldPositionsEmpty />}

        {hasPositions && (
          <Stack gap="space.04">
            {protocols.map(protocol => (
              <ProtocolSection
                key={protocol.id}
                icon={<ProtocolIcon protocolId={protocol.id} color={protocol.iconColor} letter={protocol.name[0]} />}
                name={protocol.name}
                type={protocol.type}
                externalUrl={protocol.externalUrl}
                metrics={protocol.metrics}
                totalValue={protocol.totalValue}
              >
                {protocol.positions.map(position => (
                  <PositionRow
                    key={position.id}
                    icon={
                      <AssetIcon
                        assetId={position.name}
                        color={getPositionIconColor(position.positionType)}
                        text={position.name.substring(0, 2)}
                      />
                    }
                    name={position.name}
                    type={position.type}
                    apy={position.apy}
                    balance={position.balance}
                    balanceSecondary={position.balanceSecondary}
                    positionType={position.positionType}
                  />
                ))}
              </ProtocolSection>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
