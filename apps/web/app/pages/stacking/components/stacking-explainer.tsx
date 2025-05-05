import { type HTMLStyledProps } from 'leather-styles/jsx';
import { DummyIcon } from '~/components/dummy';
import { Explainer } from '~/components/explainer';

export function StackingExplainer(props: HTMLStyledProps<'section'>) {
  return (
    <Explainer {...props}>
      <Explainer.Step
        index={0}
        title="Own STX"
        description="Get or hold STX in your wallet, ready to stack"
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
        description="Delegate and lock your STX into the chosen pool"
        img={<DummyIcon />}
      />
      <Explainer.Step
        index={3}
        title="Begin earning"
        description="Receive regular rewards without lifting a finger"
        img={<DummyIcon />}
      />
    </Explainer>
  );
}
