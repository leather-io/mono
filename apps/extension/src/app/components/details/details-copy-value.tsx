import { styled } from 'leather-styles/jsx';

import { CheckmarkIcon, CopyIcon } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';

const iconSize = 12;

interface DetailsCopyValueProps {
  value: string;
}

export function DetailsCopyValue({ value }: DetailsCopyValueProps) {
  const { onCopy, hasCopied } = useClipboard(value);
  return (
    <styled.button
      type="button"
      onClick={onCopy}
      title="Copy"
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      px="space.01"
      mr="-space.01"
      borderRadius="sm"
      textStyle="caption.01"
      color="ink.text-primary"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      {truncateMiddle(value)}
      {hasCopied ? (
        <CheckmarkIcon
          variant="small"
          width={iconSize}
          height={iconSize}
          color="green.action-primary-default"
        />
      ) : (
        <CopyIcon variant="small" width={iconSize} height={iconSize} color="ink.text-subdued" />
      )}
    </styled.button>
  );
}
