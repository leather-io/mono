import { ReactElement, ReactNode, forwardRef } from 'react';

import { Box, Flex, Stack } from 'leather-styles/jsx';
import { Title } from '~/components/title';

import { Button, ButtonProps } from '@leather.io/ui';

// import { Title } from '@components/title';

interface StepProps {
  title: string;
  children?: ReactNode;
}

/**
 * A container for a single piece of information the user needs to provide.
 * Intended to contain a description and an input of some kind.
 *
 * ```tsx
 * function InfoUserNeedsToProvide() {
 *   return (
 *     <Step title="Some Info">
 *       <Description>
 *         <p>The user needs to provide this info</p>
 *       </Description>
 *       <input id="some-info" />
 *     </Step>
 *   );
 * }
 * ```
 */
export function Step(props: StepProps) {
  const { title, children, ...rest } = props;
  return (
    <Flex flexDirection="column" mt="space.04" {...rest}>
      <Title
        fontFamily="diatype"
        fontWeight="500"
        textTransform="unset"
        fontSize="26px"
        mt="space.04"
        mr="space.02"
      >
        {title}
      </Title>
      <Box>{children}</Box>
    </Flex>
  );
}

interface DescriptionProps {
  /**
   * Elements containig text descriptions. Uses `ReactElement` instead of
   * ReactNode since the internal `Stack` component used can't handle all
   * ReactNode types, such as string.
   */
  children: ReactElement | ReactElement[];
}
/**
 * A container around helpful information about the input the user is asked to
 * provide. May be of a longer form, and have several sentences or paragraphs.
 * Expects to have elements containing text as children.
 *
 * ```tsx
 * function InfoUserNeedsToProvide() {
 *   return (
 *     <Step title="Some Info">
 *       <Description>
 *         <p>The user should know about this before providing their info.</p>
 *         <p>This is also useful to the user.</p>
 *       </Description>
 *       <input id="some-info" />
 *     </Step>
 *   );
 * }
 * ```
 */
export function Description({ children }: DescriptionProps) {
  return (
    <Stack display="block" textStyle="body.large">
      {children}
    </Stack>
  );
}

type ActionProps = ButtonProps & {
  isLoading?: boolean;
  isDisabled?: boolean;
};

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ children, isLoading, isDisabled, ...props }, ref) => (
    <Button
      size="md"
      mt="loose"
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      ref={ref}
      {...props}
    >
      {children}
    </Button>
  )
);

Action.displayName = 'Action';
