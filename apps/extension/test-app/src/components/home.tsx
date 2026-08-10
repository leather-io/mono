import React, { useState } from 'react';

import { Box, BoxProps, Flex, styled } from 'leather-styles/jsx';

import { Bitcoin } from './bitcoin';
import { Bns } from './bns';
import { Signature } from './signature';
import { Tab } from './tab';

type Tabs = 'bns' | 'signature' | 'bitcoin';

function Container({ children, ...props }: BoxProps) {
  return (
    <Box width="100%" px={6} {...props}>
      <Box maxWidth="900px" mx="auto">
        {children}
      </Box>
    </Box>
  );
}

function Page({ tab, setTab }: { tab: Tabs; setTab(value: Tabs): void }) {
  return (
    <>
      <Container borderColor="#F0F0F5" borderWidth={0} borderBottomWidth="1px">
        <Flex>
          <Tab active={tab === 'bns'}>
            <styled.span onClick={() => setTab('bns')}>BNS</styled.span>
          </Tab>
          <Tab active={tab === 'signature'}>
            <styled.span onClick={() => setTab('signature')}>Signature</styled.span>
          </Tab>
          <Tab active={tab === 'bitcoin'}>
            <styled.span onClick={() => setTab('bitcoin')}>Bitcoin</styled.span>
          </Tab>
        </Flex>
      </Container>
      <Container>
        {tab === 'bns' && <Bns />}
        {tab === 'signature' && <Signature />}
        {tab === 'bitcoin' && <Bitcoin />}
      </Container>
    </>
  );
}

export function Home() {
  const [tab, setTab] = useState<Tabs>('bitcoin');

  return (
    <Container>
      <styled.h1 textStyle="heading.01" mb="space.05" display="block">
        Testnet Demo
      </styled.h1>
      <Page tab={tab} setTab={setTab} />
    </Container>
  );
}
