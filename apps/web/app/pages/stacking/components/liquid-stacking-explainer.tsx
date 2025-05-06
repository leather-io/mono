import { type HTMLStyledProps } from 'leather-styles/jsx';
import { Explainer } from '~/components/explainer';

export function LiquidStackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      <Explainer.Step
        index={0}
        title="Own STX"
        description="Get or hold STX in your wallet, ready to stack"
      />
      <Explainer.Step
        index={1}
        title="Choose a provider"
        description="Pick a protocol from the table below"
      />
      <Explainer.Step
        index={2}
        title="Lock STX"
        description="Lock your STX and receive a token (e.g. stSTX), maintaining liquidity"
      />
      <Explainer.Step
        index={3}
        title="Begin earning"
        description="Use your derivative in DeFi and swap back anytime while earning"
      />
    </Explainer>
  );
}
