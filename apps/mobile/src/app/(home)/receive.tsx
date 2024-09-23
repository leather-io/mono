import { HeaderAvoidingContainer } from '@/components/headers/containers/header-avoiding-container';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export default function ReceiveScreen() {
  return (
    <HeaderAvoidingContainer justifyContent="center" alignItems="center">
      <Text>{t`Receive 💰`}</Text>
    </HeaderAvoidingContainer>
  );
}
