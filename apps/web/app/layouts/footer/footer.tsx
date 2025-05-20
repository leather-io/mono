import { externalLeatherNavigator } from '~/utils/external-leather-navigator';

import { FooterLayout as Footer } from './footer.layout';

function AppFooter() {
  return (
    <Footer>
      <Footer.Grid>
        <Footer.Column title="Dive deeper">
          <Footer.Link href={externalLeatherNavigator.guides}>Guide</Footer.Link>
          <Footer.Link href={externalLeatherNavigator.news}>FAQ</Footer.Link>
          <Footer.Link href={externalLeatherNavigator.blog}>Blog</Footer.Link>
          <Footer.Link href={externalLeatherNavigator.docs}>Developer docs</Footer.Link>
        </Footer.Column>

        <Footer.Column title="Legal & policies">
          <Footer.Link href="https://leather.io/privacy-policy">Privacy Policy</Footer.Link>
          <Footer.Link href="https://leather.io/terms">Terms of Service</Footer.Link>
          <Footer.Link href="https://trustmachines.notion.site/Public-assets-00144dc5c69142199b00788ff61d721c">
            Brand assets
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Earn">
          <Footer.Link href="https://earn.leather.io/pool-admin">Pool administration</Footer.Link>
          <Footer.Link href="https://earn.leather.io/signer/generate-signature">
            Signer key signature
          </Footer.Link>
          <Footer.Link href="https://earn.leather.io/choose-stacking-method">
            Stack independently
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Stay in touch">
          <Footer.Link withIcon href="https://twitter.com/leatherbtc">
            X
          </Footer.Link>
          <Footer.Link withIcon href="https://discord.gg/leatherwallet">
            Discord
          </Footer.Link>
          <Footer.Link withIcon href="https://www.youtube.com/@Leather-io">
            YouTube
          </Footer.Link>
          <Footer.Link withIcon href="https://github.com/leather-io">
            GitHub
          </Footer.Link>
        </Footer.Column>
      </Footer.Grid>

      <Footer.LegalText
        mt="space.10"
        product="A Trust Machines product"
        // Hard coding date as Cloudflare Workers renders new Date() as epoch
        // start time
        copyright="© 2025 Leather Wallet, LLC"
      />
    </Footer>
  );
}
export { AppFooter as Footer };
