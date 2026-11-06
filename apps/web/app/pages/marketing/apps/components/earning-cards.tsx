import { type ReactNode } from 'react';
import { Link } from 'react-router';

import { css, cx } from 'leather-styles/css';
import { Box, Flex, Grid, styled } from 'leather-styles/jsx';

import { dualStacking, stakingOptions } from '../apps.data';

// Each card is clickable as a whole through its primary link's ::after overlay, which keeps the
// provider tables as real tables instead of burying them inside a link.
const stretchedLinkStyles = css({
  _after: { content: '""', position: 'absolute', inset: 0, borderRadius: 'sm' },
  _focusVisible: {
    outline: 'none',
    _after: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '-2px' },
  },
});

function EarningCard({ children }: { children: ReactNode }) {
  return (
    <Flex
      position="relative"
      flexDirection="column"
      height="100%"
      minHeight={[null, null, '406px']}
      p="space.05"
      border="default"
      borderRadius="sm"
      bg="ink.background-primary"
      overflow="hidden"
      transition="background-color 120ms ease"
      _hover={{ bg: 'ink.background-secondary' }}
    >
      {children}
    </Flex>
  );
}

function DualStackingCard() {
  return (
    <EarningCard>
      <styled.h3 textStyle="heading.05" fontWeight={400}>
        {dualStacking.title}
      </styled.h3>
      <styled.p textStyle="label.01" fontWeight={400} mt="space.04">
        {dualStacking.highlight}
      </styled.p>
      <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.01">
        {dualStacking.description}
      </styled.p>
      <Box mt="space.05">
        <a
          href={dualStacking.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            css({
              display: 'inline-flex',
              alignItems: 'center',
              height: '40px',
              px: 'space.04',
              borderRadius: 'round',
              bg: 'ink.action-primary-default',
              color: 'ink.background-primary',
              textStyle: 'label.02',
              fontWeight: 400,
              _hover: { bg: 'ink.action-primary-hover' },
            }),
            stretchedLinkStyles
          )}
        >
          {dualStacking.cta}
        </a>
      </Box>
      <styled.img
        src={dualStacking.image.src}
        alt=""
        htmlWidth={dualStacking.image.width}
        htmlHeight={dualStacking.image.height}
        loading="lazy"
        decoding="async"
        display="block"
        alignSelf="flex-end"
        w={['100%', null, '409px']}
        maxW="100%"
        h="auto"
        mt={['space.05', null, 'auto']}
        mr="-space.05"
        mb="-space.05"
      />
    </EarningCard>
  );
}

function StakingOptionCard({ option }: { option: (typeof stakingOptions)[number] }) {
  return (
    <EarningCard>
      <styled.h3 textStyle="heading.05" fontWeight={400}>
        <Link to={option.href} className={stretchedLinkStyles}>
          {option.title}
        </Link>
      </styled.h3>
      <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.04" maxW="215px">
        {option.description}
      </styled.p>
      <styled.table width="100%" mt="space.07" borderCollapse="collapse" whiteSpace="nowrap">
        <thead>
          <tr>
            <styled.th
              textAlign="left"
              textStyle="caption.01"
              fontWeight={400}
              color="ink.text-non-interactive"
              pb="space.03"
            >
              Providers
            </styled.th>
            <styled.th
              textAlign="right"
              textStyle="caption.01"
              fontWeight={400}
              color="ink.text-non-interactive"
              pb="space.03"
            >
              Historical yield
            </styled.th>
          </tr>
        </thead>
        <tbody>
          {option.providers.map(provider => (
            <styled.tr key={provider.name} borderBottom="default">
              <styled.td py="space.04">
                <Flex alignItems="center" gap="space.03" textStyle="caption.01">
                  <styled.img
                    src={provider.logo}
                    alt=""
                    htmlWidth={32}
                    htmlHeight={32}
                    w="32px"
                    h="32px"
                    loading="lazy"
                    borderRadius="xs"
                  />
                  {provider.name}
                </Flex>
              </styled.td>
              <styled.td py="space.04" pl="space.03" textAlign="right" textStyle="caption.01">
                {provider.historicalYield}
              </styled.td>
            </styled.tr>
          ))}
        </tbody>
      </styled.table>
    </EarningCard>
  );
}

export function EarningCards() {
  return (
    <Grid gridTemplateColumns={['1fr', null, '1fr 1fr', '2.13fr 1fr 1fr']} gap="space.03">
      <Box gridColumn={[null, null, '1 / -1', 'auto']}>
        <DualStackingCard />
      </Box>
      {stakingOptions.map(option => (
        <StakingOptionCard key={option.title} option={option} />
      ))}
    </Grid>
  );
}
