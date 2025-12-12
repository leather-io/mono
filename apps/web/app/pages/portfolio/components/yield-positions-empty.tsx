import { Link } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

interface YieldPositionsEmptyProps {
  illustration?: React.ReactNode;
}

function DefaultIllustration() {
  return (
    <Box
      width="270px"
      height="225px"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        width="145px"
        height="165px"
        background="linear-gradient(135deg, #2d5a4a 0%, #1a3a2e 100%)"
        borderRadius="lg"
        transform="rotate(-7deg)"
        boxShadow="0px 1px 2px rgba(0, 0, 0, 0.07)"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="20%"
          left="10%"
          right="10%"
          height="60%"
          borderRadius="50% 50% 0 0"
          border="2px solid"
          borderColor="orange.action-primary-default"
          borderBottom="none"
          opacity={0.8}
        />
        <Box
          position="absolute"
          bottom="15%"
          left="5%"
          right="5%"
          height="2px"
          background="orange.action-primary-default"
          opacity={0.6}
        />
      </Box>
    </Box>
  );
}

export function YieldPositionsEmpty({ illustration }: YieldPositionsEmptyProps) {
  return (
    <Flex alignItems="center" justifyContent="center" py="space.09">
      <Flex alignItems="center" gap="space.05">
        {illustration ?? <DefaultIllustration />}
        <Box maxWidth="445px">
          <styled.p textStyle="heading.05" color="ink.text-primary" mb="space.01">
            You haven't activated any yield yet.
          </styled.p>
          <styled.p textStyle="label.02" color="ink.text-primary">
            Try yield with{' '}
            <styled.span
              as={Link}
              to="/sbtc"
              textDecoration="underline"
              textDecorationColor="ink.border-default"
            >
              sBTC
            </styled.span>
            , start{' '}
            <styled.span
              as={Link}
              to="/stacking"
              textDecoration="underline"
              textDecorationColor="ink.border-default"
            >
              Stacking
            </styled.span>
            , or explore{' '}
            <styled.span
              as={Link}
              to="https://leather.io/apps"
              textDecoration="underline"
              textDecorationColor="ink.border-default"
            >
              Apps
            </styled.span>
            .
          </styled.p>
        </Box>
      </Flex>
    </Flex>
  );
}
