import { Flex, styled } from 'leather-styles/jsx';

import { ListContainer } from '@leather.io/ui';

const defaultTitle = 'No activity yet';
const illustrationSize = '96px';
// Shared floor so the empty state never collapses and stays aligned with a
// neighbouring container (e.g. the vault empty state on the dashboard).
const defaultMinHeight = '288px';

interface ActivityEmptyStateProps {
  title?: string;
  description?: string;
  minHeight?: string;
}

export function ActivityEmptyState({
  title = defaultTitle,
  description,
  minHeight = defaultMinHeight,
}: ActivityEmptyStateProps) {
  return (
    <ListContainer height="100%">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        gap="space.01"
        minHeight={minHeight}
        py="space.05"
      >
        <styled.img
          src="/multisig/illustrations/no-activity.png"
          alt=""
          width={illustrationSize}
          height={illustrationSize}
          display={{ base: 'block', _dark: 'none' }}
          mb="space.02"
        />
        <styled.img
          src="/multisig/illustrations/no-activity-dark.png"
          alt=""
          width={illustrationSize}
          height={illustrationSize}
          display={{ base: 'none', _dark: 'block' }}
          mb="space.02"
        />
        <styled.span textStyle="label.02" color="ink.text-primary">
          {title}
        </styled.span>
        {description ? (
          <styled.span
            textStyle="caption.01"
            color="ink.text-subdued"
            maxWidth="220px"
            style={{ textWrap: 'balance' }}
          >
            {description}
          </styled.span>
        ) : null}
      </Flex>
    </ListContainer>
  );
}
