// Stand-in for a screen that isn't built (TODO) or that a variant can't express
// ("not in today's flow"). READ-ONLY for variant builders.
import { Flex, styled } from 'leather-styles/jsx';

interface ScreenPlaceholderProps {
  title: string;
  note?: string;
}

export function ScreenPlaceholder({ title, note }: ScreenPlaceholderProps) {
  return (
    <Flex
      flex="1"
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="space.02"
      p="space.05"
      textAlign="center"
    >
      <styled.span textStyle="label.01" color="ink.text-primary">
        {title}
      </styled.span>
      {note ? (
        <styled.span textStyle="caption.01" color="ink.text-subdued" maxWidth="32ch">
          {note}
        </styled.span>
      ) : null}
    </Flex>
  );
}
