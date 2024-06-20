import { useRouter } from 'expo-router';

import { WaitingList } from './waiting-list';

export default function WaitingListPage() {
  const router = useRouter();
  return <WaitingList onHiddenPressAction={() => router.replace('/')} />;
}
