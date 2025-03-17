import { styled } from 'leather-styles/jsx';
import { Page } from '~/components/page';

export function Earn() {
  return (
    <Page>
      <styled.h1>Earn</styled.h1>
      <styled.h2 textStyle="heading.05">Stack in a pool</styled.h2>
      <styled.p textStyle="caption.01" mt="space.02">
        Stacking in a pool with others and earn a reward proportional to the amount stacked
      </styled.p>
      <styled.div
        mt="space.07"
        w="100%"
        height="300px"
        background="ink.border-default"
        borderRadius="lg"
      />
      <styled.h2 textStyle="heading.05" mt="space.05">
        Liquid stacking
      </styled.h2>
      <styled.p textStyle="caption.01" mt="space.02">
        Stack while keeping your STX liquid
      </styled.p>
      <styled.div
        my="space.07"
        w="100%"
        height="300px"
        background="ink.border-default"
        borderRadius="lg"
      />
    </Page>
  );
}
