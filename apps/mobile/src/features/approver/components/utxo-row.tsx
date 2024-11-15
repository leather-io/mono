import { Avatar, Flag, ItemLayout, LockIcon, UnlockIcon } from '@leather.io/ui/native';

export function UtxoRow({ isLocked }: { isLocked: boolean }) {
  const icon = isLocked ? <LockIcon /> : <UnlockIcon color="red" />;
  /* eslint-disable-next-line lingui/no-unlocalized-strings  */
  const testAddress1 = 'F418...9e16';
  /* eslint-disable-next-line lingui/no-unlocalized-strings  */
  const testAddress2 = 'bc1p...tsc0 6e';
  return (
    <Flag img={<Avatar bg="ink.background-secondary">{icon}</Avatar>}>
      <ItemLayout
        titleLeft={testAddress1}
        captionLeft={testAddress2}
        titleRight="0.000034 BTC"
        captionRight="$ 1.65"
      />
    </Flag>
  );
}
