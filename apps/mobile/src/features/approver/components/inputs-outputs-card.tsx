import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

import { UtxoRow } from './utxo-row';

export function InputsAndOutputsCard() {
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.inputs-outputs.title',
          message: 'Inputs and Outputs',
        })}
      </Text>
      <Text variant="label01">
        {t({
          id: 'approver.inputs-outputs.input.title',
          message: 'Input',
        })}
      </Text>
      <Box gap="4">
        <UtxoRow isLocked />
        <UtxoRow isLocked={false} />
      </Box>
      <Text variant="label01">
        {t({
          id: 'approver.inputs-outputs.output.title',
          message: 'Output',
        })}
      </Text>
      <Box gap="4">
        <UtxoRow isLocked />
        <UtxoRow isLocked={false} />
      </Box>
    </>
  );
}
