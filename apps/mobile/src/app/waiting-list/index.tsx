import { useRouter } from 'expo-router';

import { WaitingList as WaitingListLayout } from './waiting-list-layout';

export default function WaitingList() {
  const router = useRouter();
  return <WaitingListLayout onHiddenPressAction={() => router.replace('/')} />;
}
