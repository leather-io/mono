import { ReactElement } from 'react';

import { Box, Flex } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';

type Slots = 'stackingStepsPanel' | 'stackingForm';

type StartStackingLayoutProps = Record<Slots, ReactElement>;

export function StartStackingLayout(props: StartStackingLayoutProps) {
  const { stackingStepsPanel, stackingForm } = props;
  return (
    <Page mx="0">
      <Flex
        flexDirection={['column-reverse', 'column-reverse', 'row']}
        justifyContent="center"
        alignItems="flex-start"
      >
        <Box maxWidth={[null, null, null, '500px']} mr={[null, null, 'space.05', 'space.08']}>
          {stackingForm}
        </Box>
        <Box display={['none', null, 'block']}>{stackingStepsPanel}</Box>
      </Flex>
    </Page>
  );
}
