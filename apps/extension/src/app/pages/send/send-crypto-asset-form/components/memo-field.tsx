import { useController } from 'react-hook-form';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Box } from 'leather-styles/jsx';

import { Input } from '@leather.io/ui';

import { useShowFieldError } from '@app/common/form-utils';
import { TextInputFieldError } from '@app/components/field-error';

const name = 'memo';

export function MemoField() {
  const { field } = useController<{ memo: string }>({ name });

  const showError = useShowFieldError(name);

  return (
    <Box width="100%" mt="space.04">
      <Input.Root hasError={!!showError}>
        <Input.Label>Memo</Input.Label>
        <Input.Field
          data-testid={SendCryptoAssetSelectors.MemoFieldInput}
          name={field.name}
          ref={field.ref}
          value={field.value}
          onBlur={field.onBlur}
          onChange={field.onChange}
        />
      </Input.Root>
      <Box mt="space.02">
        <TextInputFieldError name={name} />
      </Box>
    </Box>
  );
}
