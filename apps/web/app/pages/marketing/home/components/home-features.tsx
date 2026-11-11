import { Box, Flex, Grid, styled } from 'leather-styles/jsx';
import { LottieAnimation } from '~/pages/marketing/shared/lottie-animation';
import { MarketingTag } from '~/pages/marketing/shared/marketing-tag';
import { Reveal } from '~/pages/marketing/shared/reveal';

import { ActivityMockup, BtcNotificationsMockup } from './bento-activity';
import { ManageTokensMockup, ReviewTransactionMockup } from './bento-clarity';
import {
  BondPositionsAnimation,
  LedgerAnimation,
  MultisigVaultAnimation,
  SwapsCoins,
  animationsPath,
} from './home-animations';
import { CheckItem, FeatureCard, HomeSection, HomeSectionHeading } from './home-layout';

// Every bento visual sits on the same stage, so all cards share one height
const cardAspect = '592 / 444';

export function HomeSwapsAndLedger() {
  return (
    <>
      <HomeSection
        aria-labelledby="home-swaps-heading"
        mt={['space.09', null, '160px']}
        // The tilted Spline stage overhangs its slot; never let it scroll the page sideways
        overflowX="clip"
      >
        <Grid
          gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
          alignItems="center"
          gap={['space.05', null, null, 'space.09']}
        >
          <Box order={[1, null, null, 0]}>
            <Reveal>
              <HomeSectionHeading id="home-swaps-heading" lines={['Decentralized', 'swaps.']} />
            </Reveal>
            <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.05" maxW="454px">
              Swap supported Stacks tokens in your wallet. Review the rate and fees before you
              approve. Available routes depend on the token pair.
            </styled.p>
            {/* Bitflow is the swap provider on both mobile and the extension */}
            <Flex alignItems="center" gap="space.02" mt="space.05" textStyle="label.02">
              <styled.span color="ink.text-secondary">Powered by</styled.span>
              <styled.img
                src="/marketing/home/provider-bitflow.png"
                alt=""
                width="20px"
                height="20px"
                borderRadius="xs"
              />
              <styled.span color="ink.text-primary">Bitflow</styled.span>
            </Flex>
          </Box>
          <SwapsCoins />
        </Grid>
      </HomeSection>

      <HomeSection
        id="feature-hardware"
        aria-labelledby="home-ledger-heading"
        mt={['space.11', null, '200px']}
      >
        <Grid
          gridTemplateColumns={['1fr', null, null, '3fr 2fr']}
          alignItems="center"
          gap={['space.07', null, null, 'space.09']}
        >
          <Box gridColumn={[null, null, null, '1']}>
            <LedgerAnimation />
          </Box>
          <Box gridColumn={[null, null, null, '2']}>
            <Reveal>
              <HomeSectionHeading
                id="home-ledger-heading"
                lines={['Your Ledger.', 'Your approval.']}
              />
            </Reveal>
            <MarketingTag mt="space.03">Extension</MarketingTag>
            <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.05">
              Connect your Ledger to Leather’s browser extension. Review and approve supported
              Bitcoin and Stacks transactions on your device.
            </styled.p>
            <styled.ul display="flex" flexDir="column" gap="space.03" mt="space.05">
              <CheckItem>Keep signing keys on your hardware wallet</CheckItem>
              <CheckItem>Manage Bitcoin and Stacks accounts</CheckItem>
              <CheckItem>Review transaction details before signing</CheckItem>
            </styled.ul>
          </Box>
        </Grid>
      </HomeSection>
    </>
  );
}

export function HomeWallets() {
  return (
    <HomeSection aria-labelledby="home-wallets-heading">
      <Reveal>
        <HomeSectionHeading
          id="home-wallets-heading"
          lines={['All your wallets,', 'organized your way.']}
        />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.07">
        <FeatureCard
          title="Bring all your wallets"
          tag="Mobile"
          description="Create or restore wallets and keep your Bitcoin and Stacks accounts organized in one place."
          visual={
            <LottieAnimation
              src={`${animationsPath}/wallets-accounts.lottie.json`}
              poster="/marketing/home/wallets-accounts.webp"
              alt="A stack of wallet cards, the front one named Wallet 4, Play & Try, holding $568"
              aspect={cardAspect}
            />
          }
        />
        <FeatureCard
          title="Name it your way"
          tag="Mobile"
          description="Give your wallets custom names so you can tell everyday spending, savings and experiments apart."
          visual={
            <LottieAnimation
              src="/marketing/home/current/wallets-names.lottie.json"
              poster="/marketing/home/current/wallets-names.png"
              alt="A carousel of wallet avatars with custom names including Savings and Everyday"
              aspect={cardAspect}
            />
          }
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeFullControl() {
  return (
    <HomeSection aria-labelledby="home-control-heading">
      <Reveal>
        <HomeSectionHeading id="home-control-heading" lines={['Your assets.', 'Your decisions.']} />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.05">
        <FeatureCard
          title="Send and receive"
          description="Send and receive Bitcoin, STX and supported Stacks tokens. Check the recipient, amount and fees before approving."
          visual={
            <LottieAnimation
              src={`${animationsPath}/send-and-receive.lottie.json`}
              poster="/marketing/home/send-and-receive.webp"
              alt="The Send screen: 50 STX from a Stacks account to a recipient"
              aspect={cardAspect}
              // Lottielab state "State 1": loops 0–6.65 s; the rest of the file never shows
              segment={[0, 665]}
            />
          }
        />
        <FeatureCard
          title="Your tokens, at a glance"
          description="View your Bitcoin and Stacks token balances together, and choose an asset to see its details."
          visual={
            <LottieAnimation
              src="/marketing/home/current/mobile-tokens.lottie.json"
              poster="/marketing/home/current/mobile-tokens.png"
              alt="Token balances opening into Bitcoin Info with a price chart, then Activity with pending and received transactions"
              aspect={cardAspect}
            />
          }
        />
      </Grid>
      <Grid gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)']} gap="space.03" mt="space.03">
        <FeatureCard
          title="Know every move"
          description="Check transaction status, amounts and fees in your activity history."
          visual={<ActivityMockup />}
        />
        <FeatureCard
          title="Get BTC notifications"
          tag="Extension"
          description="Turn on browser notifications for alerts when Bitcoin sends and receives confirm."
          visual={<BtcNotificationsMockup />}
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeProtection() {
  return (
    <HomeSection aria-labelledby="home-protection-heading">
      <Reveal>
        <HomeSectionHeading id="home-protection-heading" lines={['Clarity,', 'at every step.']} />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)']} gap="space.03" mt="space.07">
        <FeatureCard
          title="Show or hide tokens"
          tag="Extension"
          description="Use Manage tokens to show or hide individual supported tokens in your asset list."
          visual={<ManageTokensMockup />}
        />
        <FeatureCard
          title="Review transactions"
          description="Review transaction details, requested changes and network fees before you approve."
          visual={<ReviewTransactionMockup />}
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeVaultsAndStaking() {
  return (
    <HomeSection aria-labelledby="home-vaults-heading">
      <Reveal>
        <HomeSectionHeading
          id="home-vaults-heading"
          lines={['Sign together.', 'See every bond.']}
        />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)']} gap="space.03" mt="space.07">
        <FeatureCard
          title="Shared vaults"
          tag="Web"
          description="Create a vault with your team, family or DAO. Bitcoin and Stacks transactions go out once enough members have signed."
          visual={<MultisigVaultAnimation aspect={cardAspect} />}
        />
        <FeatureCard
          title="Bitcoin Staking bonds"
          tag="Extension"
          description="BTC locked in a Bitcoin Staking bond counts in your balance, with each bond’s amount, unlock date and status."
          visual={<BondPositionsAnimation aspect={cardAspect} />}
        />
      </Grid>
    </HomeSection>
  );
}
