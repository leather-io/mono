import { t } from '@lingui/core/macro';

import { Avatar, Badge, Box, Cell, SparkleIcon } from '@leather.io/ui/native';

export function SponsoredFeeCard() {
  return (
    <Box mx="-5">
      <Cell.Root pressable={false}>
        <Cell.Icon>
          <Avatar icon={<SparkleIcon />} />
        </Cell.Icon>
        <Cell.Content>
          <Cell.Label variant="primary">{t`Sponsored fee`}</Cell.Label>
        </Cell.Content>
        <Cell.Aside>
          <Badge label={t`FREE`} variant="success" />
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
