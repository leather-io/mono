import { useNavigate } from 'react-router';

import { Flex, FlexProps, styled } from 'leather-styles/jsx';

import { BitcoinFilledCircleIcon, Flag } from '@leather.io/ui';

import { StartEarningButtonLayout } from './start-earning-button';

interface IndependentStackingDetailsProps extends FlexProps {}
export function IndependentStackingDetails(props: IndependentStackingDetailsProps) {
  const navigate = useNavigate();
  // TODO: finish
  return (
    <Flex
      border="default"
      borderRadius="sm"
      h="64px"
      textStyle="label.03"
      alignItems="center"
      px="space.06"
      {...props}
    >
      {/* TODO: Add details for independent stacking */}
      <styled.span>Solo Stacking</styled.span>
      <Flag img={<BitcoinFilledCircleIcon />}>BTC</Flag>
      <styled.span>100,000 STX dummy</styled.span>
      <styled.span>10% historical yield</styled.span>
      <StartEarningButtonLayout onClick={() => navigate('/stacking/independent')} />
    </Flex>
  );
}
