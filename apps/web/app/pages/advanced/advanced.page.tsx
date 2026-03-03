import { Page } from '~/layouts/page/page';

import { AdvancedTool as Tool } from './components/advanced-tool';
import { AdvancedToolItemWithAuth } from './components/advanced-tool-item-with-auth';

export function AdvancedPage() {
  return (
    <Page>
      <Page.Header title="Advanced" />
      <Page.Heading title="Stacks" />

      <Tool.Root>
        <AdvancedToolItemWithAuth
          name="Stacking signer key generation"
          description="Signer key signature generation required for certain PoX transactions"
          to="/advanced/signer-key-generation"
        />
        <AdvancedToolItemWithAuth
          name="Send many"
          description="Send STX, sBTC, or USDC to multiple recipients in a single transaction"
          to="/advanced/send-many/stx"
        />
      </Tool.Root>
    </Page>
  );
}
