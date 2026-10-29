import { Box, Grid, styled } from 'leather-styles/jsx';
import { LottieAnimation } from '~/pages/marketing/shared/lottie-animation';
import { Reveal } from '~/pages/marketing/shared/reveal';

import { LedgerAnimation, SpamFreeAnimation, SwapsCoins, animationsPath } from './home-animations';
import { CheckItem, FeatureCard, HomeSection, HomeSectionHeading } from './home-layout';

const largeCardAspect = '592 / 444';
const smallCardAspect = '391 / 283';

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
              Swap over 100 tokens. Instantly, privately, and with full control. No accounts. No
              middlemen. No limits.
            </styled.p>
            <styled.ul
              aria-label="Swap providers"
              display="flex"
              flexWrap="wrap"
              columnGap="space.05"
              rowGap="space.03"
              mt="space.05"
            >
              <CheckItem>Bitflow</CheckItem>
              <CheckItem>Velar</CheckItem>
              <CheckItem>sBTC Bridge</CheckItem>
              <CheckItem>ALEX</CheckItem>
            </styled.ul>
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
                lines={['Best in class', 'Ledger support.']}
              />
            </Reveal>
            <styled.p textStyle="body.02" color="ink.text-secondary" mt="space.05">
              Create or restore wallets in seconds, keeping all your Bitcoin and Stacks accounts in
              one secure place.
            </styled.p>
            <styled.ul display="flex" flexDir="column" gap="space.03" mt="space.05">
              <CheckItem>Smart signing for a safer Ledger experience</CheckItem>
              <CheckItem>Seamless multi-chain BTC &amp; STX experience</CheckItem>
              <CheckItem>Connect once and sign smoothly</CheckItem>
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
          lines={['All your wallets,', 'perfectly organized.']}
        />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.07">
        <FeatureCard
          title="Bring all your wallets"
          tag="Mobile"
          description="Create or restore wallets in seconds, keeping all your Bitcoin and Stacks accounts in one secure place."
          visual={
            <LottieAnimation
              src={`${animationsPath}/wallets-accounts.lottie.json`}
              poster="/marketing/home/wallets-accounts.webp"
              alt="A stack of wallet cards, the front one named Wallet 4, Play & Try, holding $568"
              aspect={largeCardAspect}
            />
          }
        />
        <FeatureCard
          title="Name it your way"
          tag="Mobile"
          description="Personalize your wallets with custom names to stay organized and instantly recognize the accounts that matter most."
          visual={
            <LottieAnimation
              src={`${animationsPath}/wallets-names.lottie.json`}
              poster="/marketing/home/wallets-names.webp"
              alt="A carousel of wallet avatars with the selected wallet named Ordinals"
              aspect={largeCardAspect}
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
        <HomeSectionHeading id="home-control-heading" lines={['Full control,', 'no compromise.']} />
      </Reveal>
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.05">
        <FeatureCard
          title="Send and receive"
          description="Transfer Bitcoin, tokens, and collectibles securely and instantly, with clear transaction details every step of the way."
          visual={
            <LottieAnimation
              src={`${animationsPath}/send-and-receive.lottie.json`}
              poster="/marketing/home/send-and-receive.webp"
              alt="The Send screen: 50 STX from a Stacks account to a recipient"
              aspect={largeCardAspect}
              // Lottielab state "State 1": loops 0–6.65 s; the rest of the file never shows
              segment={[0, 665]}
            />
          }
        />
        <FeatureCard
          title="Your collection, beautifully organised"
          tag="Mobile"
          description="See all your tokens and stacks collectibles at a glance, designed for clarity and a clean visual experience."
          visual={
            <LottieAnimation
              src={`${animationsPath}/collection.lottie.json`}
              poster="/marketing/home/collection.webp"
              alt="The Tokens tab listing Stacks, Bitcoin and sBTC balances"
              aspect={largeCardAspect}
            />
          }
        />
      </Grid>
      <Grid
        gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
        gap="space.03"
        mt="space.03"
      >
        <FeatureCard
          title="Send sBTC without fees"
          description="Transfer securely and instantly, with clear review step at every transaction."
          image="/marketing/home/send-sbtc.svg"
          imageAlt="Sending 0.1 sBTC, sponsored with no transaction fees"
          imageAspect="390 / 280"
        />
        <FeatureCard
          title="Know every move"
          description="Review your past transactions with full transparency and detail."
          image="/marketing/home/know-every-move.svg"
          imageAlt="Activity list with sending, sent and received transactions"
          imageAspect="390 / 280"
        />
        <FeatureCard
          title="Get BTC notifications"
          tag="Extension"
          description="Get instant notification every time you receive Bitcoin in your wallet."
          visual={
            <LottieAnimation
              src={`${animationsPath}/btc-notifications.lottie.json`}
              poster="/marketing/home/btc-notifications.webp"
              alt="A notification: BTC received 5 min ago"
              aspect={smallCardAspect}
            />
          }
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeProtection() {
  return (
    <HomeSection aria-labelledby="home-protection-heading">
      <Reveal>
        <HomeSectionHeading id="home-protection-heading" lines={['Protection', 'at every step.']} />
      </Reveal>
      <Grid
        gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
        gap="space.03"
        mt="space.07"
      >
        <FeatureCard
          title="Stay spam free"
          tag="Extension"
          description="Filter unwanted tokens and collectibles, keeping your wallet clean and safe."
          visual={<SpamFreeAnimation aspect={smallCardAspect} />}
        />
        <FeatureCard
          title="Review transactions"
          description="Transfer securely and instantly, with clear review step at every transaction."
          visual={
            <LottieAnimation
              src={`${animationsPath}/review-transactions.lottie.json`}
              poster="/marketing/home/review-transactions.webp"
              alt="A Clarity contract call to review, with Edit and Approve buttons"
              aspect={smallCardAspect}
            />
          }
        />
        <FeatureCard
          title="UTXO protection"
          tag="Extension"
          description="Prevent accidental misuse of Ordinal Inscriptions with UTXO safeguards."
          image="/marketing/home/utxo-protection.webp"
          imageAlt="An inscription of a psychedelic cat with a lock badge"
          imageAspect="780 / 560"
        />
      </Grid>
    </HomeSection>
  );
}
