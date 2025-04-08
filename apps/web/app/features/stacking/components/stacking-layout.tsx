import { ReactElement } from 'react';

import { Box, Flex } from 'leather-styles/jsx';
import { Page } from '~/features/page/page';

type Slots = 'stackingInfoPanel' | 'stackingForm';

type StartStackingLayoutProps = Record<Slots, ReactElement>;

export function StartStackingLayout(props: StartStackingLayoutProps) {
  const { stackingInfoPanel, stackingForm } = props;
  return (
    <Page pt="space.05" mb="space.05">
      <Flex
        flexDirection={['column-reverse', 'column-reverse', 'row']}
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box maxWidth={[null, null, '544px']} mr={[null, null, 'space.05']}>
          <Box display={['block', null, 'none']} mt={['space.05', null, null, null, 'space.04']}>
            {stackingInfoPanel}
          </Box>
          {stackingForm}
        </Box>
        <Box display={['none', null, 'block']}>{stackingInfoPanel}</Box>
      </Flex>
    </Page>
  );
}
