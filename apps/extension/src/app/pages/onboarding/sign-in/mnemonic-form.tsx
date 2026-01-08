import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { Form, Formik, type FormikHelpers, type FormikProps } from 'formik';
import { Stack } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';
import { createNullArrayOfLength, isEmpty } from '@leather.io/utils';

import { ErrorLabel } from '@app/components/error-label';
import { useSignIn } from '@app/pages/onboarding/sign-in/hooks/use-sign-in';
import { MnemonicWordInput } from '@app/ui/components/secret-key/mnemonic-key/mnemonic-word-input';
import {
  getMnemonicErrorFields,
  getMnemonicErrorMessage,
  hasMnemonicFormValues,
} from '@app/ui/components/secret-key/mnemonic-key/utils/error-handling';
import { validationSchema } from '@app/ui/components/secret-key/mnemonic-key/utils/validation';
import { SecretKeyGrid } from '@app/ui/components/secret-key/secret-key-grid';

interface MnemonicFormProps {
  mnemonic: (string | null)[];
  setMnemonic(mnemonic: (string | null)[]): void;
  twentyFourWordMode: boolean;
}
type MnemonicFormValues = Record<string, string>;
export function MnemonicForm({ mnemonic, setMnemonic, twentyFourWordMode }: MnemonicFormProps) {
  const { submitMnemonicForm, error, isLoading } = useSignIn();

  function mnemonicWordUpdate(index: number, word: string) {
    const newMnemonic = [...mnemonic];
    newMnemonic[index] = word;
    setMnemonic(newMnemonic);
  }

  function updateEntireKey(key: string, formik: FormikHelpers<MnemonicFormValues>) {
    const words = key.split(' ');
    words.forEach((word, index) => {
      void formik.setFieldValue(String(index + 1), word);
    });
    setMnemonic(words);
    void submitMnemonicForm(key);
  }

  function handleSubmit() {
    return void submitMnemonicForm(mnemonic.join(' '));
  }

  const mnemonicFieldArray = mnemonic ?? createNullArrayOfLength(twentyFourWordMode ? 24 : 12);

  // set initialValues to avoid throwing uncontrolled inputs error
  const initialValues: MnemonicFormValues = {};
  mnemonicFieldArray.forEach((_, index) => {
    initialValues[String(index + 1)] = '';
  });
  return (
    <Formik<MnemonicFormValues>
      initialValues={initialValues}
      // this onSubmit is to appease Formik and is only really needed in the onClick()
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
    >
      {(formik: FormikProps<MnemonicFormValues>) => {
        const { errors, touched, values, isValid } = formik;
        const hasFormValues = hasMnemonicFormValues(values);
        const mnemonicErrorFields = getMnemonicErrorFields(errors, touched, values);
        const showMnemonicErrors = !isEmpty(mnemonicErrorFields) && hasFormValues;
        const mnemonicErrorMessage = getMnemonicErrorMessage(mnemonicErrorFields);

        return (
          <Form>
            <Stack gap="space.05">
              <SecretKeyGrid>
                {mnemonicFieldArray.map((_, i) => (
                  <MnemonicWordInput
                    fieldNumber={i + 1}
                    key={i}
                    value={mnemonic[i] || ''}
                    onPasteEntireKey={(key: string) => {
                      const activeElement = document.activeElement;
                      if (activeElement instanceof HTMLElement) activeElement.blur();
                      updateEntireKey(key, formik);
                    }}
                    onUpdateWord={(w: string) => mnemonicWordUpdate(i, w)}
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
                disabled={isEmpty(touched) || !isValid || !hasFormValues}
                aria-busy={isLoading}
                fullWidth
                type="submit"
                variant="solid"
                onClick={e => {
                  e.preventDefault();
                  return handleSubmit();
                }}
              >
                Continue
              </Button>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}
