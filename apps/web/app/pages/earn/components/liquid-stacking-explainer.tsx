import { type HTMLStyledProps } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { Explainer } from '~/components/explainer';

export function LiquidStackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      <Explainer.Step
        index={0}
        title="Own STX"
        description="Acquire or hold STX in your wallet, ready to stack"
        img={<DummyIcon />}
      />
      <Explainer.Step
        index={1}
        title="Choose a provider"
        description="Pick a protocol from the table below"
        img={<DummyIcon />}
      />
      <Explainer.Step
        index={2}
        title="Lock STX"
        description="Lock your STX and receive a token (e.g. stSTX), maintaining liquidity"
        img={<DummyIcon />}
      />
      <Explainer.Step
        index={3}
        title="Begin earning"
        description="Use your derivative in DeFi and swap back anytime while earning"
        img={<DummyIcon />}
      />
    </Explainer>
  );
}
