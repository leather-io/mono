import { HeaderAvoidingContainer } from '@/components/headers/containers/header-avoiding-container';
import { TransText } from '@/components/trans-text';

export default function SwapScreen() {
  return (
    <HeaderAvoidingContainer justifyContent="center" alignItems="center">
      <TransText>Swap 🔄</TransText>
    </HeaderAvoidingContainer>
  );
}
