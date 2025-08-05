import { Link } from 'react-router';

import { Page } from '~/layouts/page/page';

import { AdvancedTool as Tool } from './components/advanced-tool';

const demoItems = false; // Set to true to show demo items

export function AdvancedPage() {
  return (
    <Page>
      <Page.Header title="Advanced" />
      <Page.Heading title="Stacks" />

      <Tool.Root>
        <Link to="/advanced/signer-key-generation">
          <Tool.Item
            name="Stacking signer key generation"
            description="Signer key signature generation required for certain PoX transactions"
          />
        </Link>
        {demoItems && (
          <>
            <Tool.Item
              filter="opacity(.5)"
              name="Stacks Smart Contracts"
              description="Tools for developing and deploying smart contracts on Stacks."
            />
            <Tool.Item
              filter="opacity(.5)"
              name="Stacks Testnet"
              description="A test environment for Stacks applications."
            />
            <Tool.Item
              filter="opacity(.5)"
              name="Stacks Mainnet"
              description="The main network for Stacks applications."
            />
          </>
        )}
      </Tool.Root>

      {/* <Page.Heading title="Bitcoin" />

      <Tool.Root mb="space.06">
        <Tool.Item
          filter="opacity(.5)"
          name="UTXO Consolidator"
          description="A tool that to help merge many small UTXOs into a single one"
        />
        <Tool.Item
          filter="opacity(.5)"
          name="PSBT builder"
          description="A tool to help build PSBTs (Partially Signed Bitcoin Transactions)"
        />
      </Tool.Root> */}
    </Page>
  );
}
