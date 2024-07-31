import { HeaderAvoidingContainer } from '@/components/headers/containers/header-avoiding-container';
import { TransText } from '@/components/trans-text';

export default function SendScreen() {
  return (
    <HeaderAvoidingContainer justifyContent="center" alignItems="center">
      <TransText>Send</TransText>
    </HeaderAvoidingContainer>
  );
}
