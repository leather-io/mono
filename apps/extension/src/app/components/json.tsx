import { bytesToHex } from '@stacks/common';
import { css } from 'leather-styles/css';
import { Box } from 'leather-styles/jsx';

import { isBigInt, isTypedArray } from '@leather.io/utils';

function parseJsonReadable(value: unknown) {
  if (isBigInt(value)) return value.toString();
  if (isTypedArray(value)) return bytesToHex(value);
  return value;
}

interface JsonProps {
  value: unknown;
}

export function Json(value: JsonProps) {
  return (
    <Box
      className={css({
        '& pre': {
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        },
      })}
      textStyle="caption.01"
      mt="space.05"
    >
      <pre>{JSON.stringify(value, (_, v: unknown) => parseJsonReadable(v), 2)}</pre>
    </Box>
  );
}
