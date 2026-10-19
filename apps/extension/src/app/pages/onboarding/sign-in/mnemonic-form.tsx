import { FormProvider, useForm } from 'react-hook-form';

import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Stack } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';
import { isEmpty } from '@leather.io/utils';

import { ErrorLabel } from '@app/components/error-label';
import { MnemonicWordInput } from '@app/ui/components/secret-key/mnemonic-key/mnemonic-word-input';
import {
  type MnemonicFormValues,
  getMnemonicErrorFields,
  getMnemonicErrorMessage,
  hasMnemonicFormValues,
} from '@app/ui/components/secret-key/mnemonic-key/utils/error-handling';
import { mnemonicFormResolver } from '@app/ui/components/secret-key/mnemonic-key/utils/validation';
import { SecretKeyGrid } from '@app/ui/components/secret-key/secret-key-grid';

interface MnemonicFormProps {
  mnemonic: (string | null)[];
  setMnemonic(mnemonic: (string | null)[]): void;
  twentyFourWordMode: boolean;
  onSubmit(mnemonic: string): Promise<void>;
  error: string | undefined;
  isLoading: boolean;
}
export function MnemonicForm({
  mnemonic,
  setMnemonic,
  twentyFourWordMode,
  onSubmit,
  error,
  isLoading,
}: MnemonicFormProps) {
  function mnemonicWordUpdate(index: number, word: string) {
    const newMnemonic = [...mnemonic];
    newMnemonic[index] = word;
    setMnemonic(newMnemonic);
  }

  function updateEntireKey(key: string) {
    const newKey = key.split(' ');
    newKey.forEach((word, index) => form.setValue(`${index + 1}`, word, { shouldValidate: true }));
    setMnemonic(newKey);
    void onSubmit(key);
  }

  function handleSubmit() {
    return onSubmit(mnemonic.join(' '));
  }

  const mnemonicFieldArray = mnemonic
    ? mnemonic
    : new Array<string | null>(twentyFourWordMode ? 24 : 12).fill(null);

  // set initialValues to avoid throwing uncontrolled inputs error
  const initialValues = mnemonicFieldArray.reduce<MnemonicFormValues>(
    (accumulator, _, index) => ((accumulator[`${index + 1}`] = ''), accumulator),
    {}
  );

  const form = useForm<MnemonicFormValues>({
    defaultValues: initialValues,
    resolver: mnemonicFormResolver,
    mode: 'all',
    shouldUnregister: true,
  });
  const { errors, touchedFields } = form.formState;
  const values = form.watch();
  const hasFormValues = hasMnemonicFormValues(values);
  const mnemonicErrorFields = getMnemonicErrorFields(errors, touchedFields, values);
  const showMnemonicErrors = !isEmpty(mnemonicErrorFields) && hasFormValues;
  const mnemonicErrorMessage = getMnemonicErrorMessage(mnemonicErrorFields);

  return (
    <FormProvider {...form}>
      <form onSubmit={event => void form.handleSubmit(() => handleSubmit())(event)}>
        <Stack gap="space.05">
          <SecretKeyGrid>
            {mnemonicFieldArray.map((_, i) => (
              <MnemonicWordInput
                fieldNumber={i + 1}
                key={i}
                value={mnemonic[i] || ''}
                onPasteEntireKey={key => {
                  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                  updateEntireKey(key);
                }}
                onUpdateWord={w => mnemonicWordUpdate(i, w)}
              />
            ))}
          </SecretKeyGrid>
          {(showMnemonicErrors || error) && (
            <ErrorLabel data-testid={OnboardingSelectors.SignInSeedError}>
              {showMnemonicErrors ? mnemonicErrorMessage : error}
            </ErrorLabel>
          )}

          <Button
            data-testid={OnboardingSelectors.SignInBtn}
            aria-disabled={isLoading || showMnemonicErrors}
            disabled={isEmpty(touchedFields) || !isEmpty(errors) || !hasFormValues}
            aria-busy={isLoading}
            fullWidth
            type="submit"
            variant="solid"
            onClick={e => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            Continue
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
