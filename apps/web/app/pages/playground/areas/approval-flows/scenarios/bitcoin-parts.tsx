import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, Badge } from '@leather.io/ui';

import { HandshakeLabelRow, HandshakeValueRow } from '../directions/handshake-primitives';
import { useApprovalDirection } from '../pattern/approval-direction';
import { truncateMiddle } from '../pattern/approval-format';
import { ExactAmount } from '../pattern/approval-rows';

export const depositAddress = 'bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e';

type LegTag = 'yours' | 'change' | 'external' | 'data';

const legTagLabel: Record<LegTag, string> = {
  yours: 'Yours',
  change: 'Change',
  external: 'External',
  data: 'Data',
};

interface LegTagBadgeProps {
  tag: LegTag;
}

function LegTagBadge({ tag }: LegTagBadgeProps) {
  if (tag === 'yours') return <Badge label={legTagLabel[tag]} variant="success" />;
  if (tag === 'change') return <Badge label={legTagLabel[tag]} variant="success" outlined />;
  if (tag === 'data') return <Badge label={legTagLabel[tag]} variant="info" outlined />;
  return <Badge label={legTagLabel[tag]} />;
}

interface PsbtLegRowProps {
  index: number;
  tag: LegTag;
  address: string;
  amount: string;
  caption?: string;
}

export function PsbtLegRow({ index, tag, address, amount, caption }: PsbtLegRowProps) {
  const isHandshake = useApprovalDirection()?.id === 'handshake';
  if (isHandshake) {
    return (
      <Stack gap="space.02" py="space.02" minWidth={0}>
        <HandshakeLabelRow
          label={<LegTagBadge tag={tag} />}
          trailing={
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              #{index}
            </styled.span>
          }
        />
        <HandshakeValueRow>
          <Stack gap="space.01" minWidth={0}>
            <styled.span textStyle="label.02">
              <ExactAmount value={amount} symbol="BTC" />
            </styled.span>
            {tag === 'data' ? (
              <styled.span textStyle="code">{address}</styled.span>
            ) : (
              <AddressDisplayer address={address} textStyle="code" />
            )}
            {caption && (
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {caption}
              </styled.span>
            )}
          </Stack>
        </HandshakeValueRow>
      </Stack>
    );
  }
  return (
    <Flex gap="space.03" alignItems="flex-start" py="space.01">
      <Box width="72px" flexShrink={0} pt="2px">
        <LegTagBadge tag={tag} />
      </Box>
      <Stack gap="0" flex="1" minWidth={0} pt="3px">
        <Flex justifyContent="space-between" alignItems="baseline" gap="space.03">
          <styled.span textStyle="label.03" truncate>
            <styled.span color="ink.text-subdued">#{index} </styled.span>
            {tag === 'data' ? address : truncateMiddle(address)}
          </styled.span>
          <styled.span textStyle="label.03" flexShrink={0}>
            <ExactAmount value={amount} symbol="BTC" />
          </styled.span>
        </Flex>
        {caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {caption}
          </styled.span>
        )}
      </Stack>
    </Flex>
  );
}
