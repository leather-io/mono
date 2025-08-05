import { StackingClientProvider } from '~/features/stacking/providers/stacking-client-provider';
import { SignerKeyGeneration } from '~/features/tools/signer-key-generation/signer-key-generation';
import { SignerKeyGenerationLoader } from '~/features/tools/signer-key-generation/signer-key-generation.loader';
import { Page } from '~/layouts/page/page';

export function SignerKeyGenerationPage() {
  return (
    <Page>
      <Page.Header title="Signer Key Generation" />
      <StackingClientProvider>
        <SignerKeyGenerationLoader>
          {({ poxInfo }) => <SignerKeyGeneration poxInfo={poxInfo} />}
        </SignerKeyGenerationLoader>
      </StackingClientProvider>
    </Page>
  );
}
