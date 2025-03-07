import { styled } from 'leather-styles/jsx';

interface EarnProps {
  content: string;
}
export function Earn(props: EarnProps) {
  return (
    <>
      <styled.h1>Earn</styled.h1>
      <styled.div>{props.content}</styled.div>
    </>
  );
}
