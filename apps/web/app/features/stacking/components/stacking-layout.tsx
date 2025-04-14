import { ReactElement } from 'react';

import { Box, Flex } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';

type Slots = 'stackingStepsPanel' | 'stackingForm';

type StartStackingLayoutProps = Record<Slots, ReactElement>;

export function StartStackingLayout(props: StartStackingLayoutProps) {
  const { stackingStepsPanel, stackingForm } = props;
  return (
    <Page pt="space.05" mb="space.05" mx="space.02">
      <Flex
        flexDirection={['column-reverse', 'column-reverse', 'row']}
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box maxWidth={[null, null, '544px']} mr={[null, null, 'space.05']}>
          {stackingForm}
        </Box>
        <Box display={['none', null, 'block']}>{stackingStepsPanel}</Box>
      </Flex>
    </Page>
  );
}
