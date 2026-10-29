import { Box, Grid, styled } from 'leather-styles/jsx';

import { CheckItem, FeatureCard, HomeSection, HomeSectionHeading } from './home-layout';

const largeCardAspect = '592 / 444';
const smallCardAspect = '391 / 283';

export function HomeSwapsAndLedger() {
  return (
    <>
      <HomeSection aria-labelledby="home-swaps-heading" mt={['space.09', null, '160px']}>
        <Grid
          gridTemplateColumns={['1fr', null, null, '1fr 1fr']}
          alignItems="center"
          gap={['space.05', null, null, 'space.09']}
        >
          <Box order={[1, null, null, 0]}>
            <HomeSectionHeading id="home-swaps-heading" lines={['Decentralized', 'swaps.']} />
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
          <styled.img
            src="/marketing/home/swaps-coins.webp"
            alt="Hand-drawn Stacks, Bitcoin and sBTC coins tumbling through the air"
            width="100%"
            maxW="640px"
            justifySelf="center"
            height="auto"
            style={{ aspectRatio: '1200 / 876' }}
            loading="lazy"
          />
        </Grid>
      </HomeSection>

      <HomeSection
        id="feature-hardware"
        aria-labelledby="home-ledger-heading"
        mt={['space.11', null, '200px']}
      >
        <Grid gridTemplateColumns={['1fr', null, null, '3fr 2fr']}>
          <Box gridColumn={[null, null, null, '2']}>
            <HomeSectionHeading
              id="home-ledger-heading"
              lines={['Best in class', 'Ledger support.']}
            />
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
      <HomeSectionHeading
        id="home-wallets-heading"
        lines={['All your wallets,', 'perfectly organized.']}
      />
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.07">
        <FeatureCard
          title="Bring all your wallets"
          tag="Mobile"
          description="Create or restore wallets in seconds, keeping all your Bitcoin and Stacks accounts in one secure place."
          image="/marketing/home/wallets-accounts.webp"
          imageAlt="A stack of wallet cards, the front one named Wallet 4, Play & Try, holding $568"
          imageAspect={largeCardAspect}
        />
        <FeatureCard
          title="Name it your way"
          tag="Mobile"
          description="Personalize your wallets with custom names to stay organized and instantly recognize the accounts that matter most."
          image="/marketing/home/wallets-names.webp"
          imageAlt="A carousel of wallet avatars with the selected wallet named Ordinals"
          imageAspect={largeCardAspect}
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeFullControl() {
  return (
    <HomeSection aria-labelledby="home-control-heading">
      <HomeSectionHeading id="home-control-heading" lines={['Full control,', 'no compromise.']} />
      <Grid gridTemplateColumns={['1fr', null, '1fr 1fr']} gap="space.03" mt="space.05">
        <FeatureCard
          title="Send and receive"
          description="Transfer Bitcoin, tokens, and collectibles securely and instantly, with clear transaction details every step of the way."
          image="/marketing/home/send-and-receive.webp"
          imageAlt="The Send screen: 50 STX from a Stacks account to a recipient"
          imageAspect={largeCardAspect}
        />
        <FeatureCard
          title="Your collection, beautifully organised"
          tag="Mobile"
          description="See all your tokens and stacks collectibles at a glance, designed for clarity and a clean visual experience."
          image="/marketing/home/collection.webp"
          imageAlt="The Tokens tab listing Stacks, Bitcoin and sBTC balances"
          imageAspect={largeCardAspect}
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
          image="/marketing/home/btc-notifications.webp"
          imageAlt="A notification: BTC received 5 min ago"
          imageAspect={smallCardAspect}
        />
      </Grid>
    </HomeSection>
  );
}

export function HomeProtection() {
  return (
    <HomeSection aria-labelledby="home-protection-heading">
      <HomeSectionHeading id="home-protection-heading" lines={['Protection', 'at every step.']} />
      <Grid
        gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
        gap="space.03"
        mt="space.07"
      >
        <FeatureCard
          title="Stay spam free"
          tag="Extension"
          description="Filter unwanted tokens and collectibles, keeping your wallet clean and safe."
          image="/marketing/home/spam-free.webp"
          imageAlt="A Hide spam toggle above a list of suspicious tokens"
          imageAspect={smallCardAspect}
        />
        <FeatureCard
          title="Review transactions"
          description="Transfer securely and instantly, with clear review step at every transaction."
          image="/marketing/home/review-transactions.webp"
          imageAlt="A Clarity contract call to review, with Edit and Approve buttons"
          imageAspect={smallCardAspect}
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
