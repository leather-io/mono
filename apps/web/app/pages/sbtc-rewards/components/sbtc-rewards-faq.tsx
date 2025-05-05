import { HTMLStyledProps, styled } from 'leather-styles/jsx';
import { analytics } from '~/features/analytics/analytics';

import { Accordion } from '@leather.io/ui';

export function SbtcRewardsFaq(props: HTMLStyledProps<'div'>) {
  return (
    <styled.div {...props}>
      <Accordion.Root
        type="single"
        defaultValue="what-is-sbtc"
        onValueChange={value =>
          void analytics.untypedTrack('sbtc_faq_accordion_item_clicked', { value })
        }
      >
        <Accordion.Item value="what-is-sbtc">
          <Accordion.Trigger>What is sBTC?</Accordion.Trigger>
          <Accordion.Content>
            sBTC is a decentralized, 1:1 Bitcoin-backed asset on the Stacks blockchain that enables
            Bitcoin to be used in smart contracts without giving up custody. It allows users to move
            BTC into the Stacks ecosystem in a trust-minimized way, where it can be used in DeFi
            apps, lending, trading, or other on-chain activities. sBTC is pegged to real BTC and can
            be redeemed for BTC at any time, making it a powerful tool for bringing Bitcoin’s
            liquidity to smart contract platforms while maintaining Bitcoin's security and
            decentralization through the Stacks consensus model, Proof of Transfer (PoX).
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="how-do-i-get-sbtc">
          <Accordion.Trigger>How do I get sBTC?</Accordion.Trigger>
          <Accordion.Content>
            To get sBTC, you typically lock your real BTC in a decentralized manner through a
            process facilitated by the Stacks network and a group of participants called Stackers or
            signers, who manage the peg system. This process involves sending BTC to a special
            address controlled by the network, which then mints an equivalent amount of sBTC on the
            Stacks blockchain. Alternatively, you can also obtain sBTC by swapping STX or other
            assets for it on decentralized exchanges (DEXs) that support sBTC trading. Once
            acquired, sBTC can be used in smart contracts, DeFi apps, or redeemed back for native
            BTC through the unpegging process, which burns the sBTC and releases the original BTC
            back to your Bitcoin address.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="where-does-the-btc-go">
          <Accordion.Trigger>Where does the BTC go?</Accordion.Trigger>
          <Accordion.Content>
            When you get sBTC by depositing BTC, the actual Bitcoin (BTC) is held in a decentralized
            manner by a network of Stackers or signers who participate in the peg mechanism on the
            Stacks blockchain. These participants are responsible for securely holding the BTC in
            multisig addresses or smart contract-controlled wallets on the Bitcoin network. The BTC
            remains locked there while the equivalent amount of sBTC is minted on the Stacks chain.
            This design ensures that sBTC is always backed 1:1 by real BTC. When you later decide to
            redeem your sBTC, the process burns your sBTC on Stacks and triggers the release of the
            equivalent BTC from the locked pool back to your Bitcoin wallet, maintaining the peg's
            integrity and decentralization.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </styled.div>
  );
}
