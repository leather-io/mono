import { styled } from 'leather-styles/jsx';

import { PlusIcon } from '@leather.io/ui';

interface LoadMoreButtonProps {
  /** id of the list this button extends */
  controls: string;
  onClick(): void;
}

export function LoadMoreButton({ controls, onClick }: LoadMoreButtonProps) {
  return (
    <styled.button
      type="button"
      aria-controls={controls}
      onClick={onClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="space.01"
      width="100%"
      py="space.03"
      mt="space.02"
      bg="ink.background-secondary"
      borderRadius="xs"
      textStyle="label.03"
      color="ink.text-secondary"
      _hover={{ bg: 'ink.component-background-hover', color: 'ink.text-primary' }}
    >
      Load more
      <PlusIcon variant="small" color="ink.text-secondary" aria-hidden />
    </styled.button>
  );
}
