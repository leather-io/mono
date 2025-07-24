import { Box, Flex, styled } from 'leather-styles/jsx';

export function SoloStackingInfoCard() {
  return (
    <Flex
      flexDir={['column', 'column', 'row']}
      alignItems={['flex-start', 'flex-start', 'flex-start']}
      justifyContent="space-between"
      gap={['space.04', 'space.04', 'space.07']}
      mb="space.07"
      mt="space.08"
    >
      <Box flex={1}>
        <styled.h2 textStyle="heading.03" mr="space.03">
          Stack
          <br /> independently
        </styled.h2>
      </Box>
      <Flex
        flexDir="column"
        alignItems={['flex-start', 'flex-start', 'flex-end']}
        maxW={['100%', '100%', '60%']}
        flex={1}
      >
        <styled.p textStyle="label.02">
          Earn Bitcoin directly by solo stacking STX and holding reward slots.
        </styled.p>

        <styled.p textStyle="caption.01" color="ink.text-subdued">
          We don't provide the Stacking service ourselves or operate the protocols that provide
          yield.
        </styled.p>
      </Flex>
    </Flex>
  );
}
