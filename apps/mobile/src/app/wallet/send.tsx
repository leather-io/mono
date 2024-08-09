import { HeaderAvoidingContainer } from '@/components/headers/containers/header-avoiding-container';
import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export default function SendScreen() {
  return (
    <HeaderAvoidingContainer justifyContent="center" alignItems="center">
      <Text>{t`Send`}</Text>
    </HeaderAvoidingContainer>
  );
}
