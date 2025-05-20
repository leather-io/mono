import { css } from 'leather-styles/css';
import { Box, VStack, styled } from 'leather-styles/jsx';
import { InfoGrid } from '~/components/info-grid/info-grid';
import { ValueDisplayer } from '~/components/value-displayer/default-value-displayer';
import { Protocol } from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getLearnMoreLink } from '~/features/page/page';
import { usePost } from '~/utils/post-utils';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import { getPostSlugForProvider } from '~/data/data';

interface ProtocolOverviewProps {
  protocol: Protocol;
  protocolSlug: string;
}

function ProtocolCell({ protocol, protocolSlug }: ProtocolOverviewProps) {
  const postSlug = getPostSlugForProvider(protocolSlug);
  const post = usePost(postSlug || '');
  return (
    <VStack gap="space.05" alignItems="left" p="space.05">
      {protocol.icon}
      <styled.h4 textStyle="label.01">
        {protocol.name}
      </styled.h4>
      {post && (
        <styled.p textStyle="caption.01">
          {post.sentence}
          {getLearnMoreLink(post.slug, post.sentence)}
        </styled.p>
      )}
    </VStack>
  );
}

export function ProtocolOverview({ protocol, protocolSlug }: ProtocolOverviewProps) {
  return (
    <InfoGrid
      width="100%"
      gridTemplateColumns={['repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(3, 1fr)']}
      gridTemplateRows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
      height="fit-content"
      className={css({ '& > *:not(:first-child)': { height: ['120px', null, 'unset'] } })}
      borderTop="0px"
      borderLeft="0px"
      borderRight="0px"
      borderRadius="0px"
    >
      <InfoGrid.Cell gridColumn={['span 1', 'span 1', 'auto']} gridRow={['1', '1', 'span 2']}>
        <ProtocolCell protocol={protocol} protocolSlug={protocolSlug} />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['2', '2', '1']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="historical-yield" textStyle="label.02" />}
          value={"—"}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['3', '3', '1']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="total-locked-value-tvl" textStyle="label.02" />}
          value={"—"}
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '2']} gridRow={['4', '4', '2']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="stacking-rewards-tokens" textStyle="label.02" />}
          value={
            <>
              {protocol.liquidToken}
              <Box textStyle="label.03">{"-"}</Box>
            </>
          }
        />
      </InfoGrid.Cell>
      <InfoGrid.Cell gridColumn={['1', '1', '3']} gridRow={['5', '5', '2']}>
        <ValueDisplayer
          name={<PostLabelHoverCard postKey="stacking-minimum-commitment" textStyle="label.02" />}
          value={protocol.minimumDelegationAmount}
        />
      </InfoGrid.Cell>
    </InfoGrid>
  );
}
