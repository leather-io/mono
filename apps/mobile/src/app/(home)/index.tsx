import { AppRoutes } from '@/routes';
import { Redirect } from 'expo-router';

export default function Home() {
  if (!process.env.EXPO_PUBLIC_SECRET_KEY) {
    throw new Error('You need to set EXPO_PUBLIC_SECRET_KEY');
  }
  return <Redirect href={AppRoutes.WalletHome} />;
}
