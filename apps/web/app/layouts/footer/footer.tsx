import { LEATHER_DOCS } from '~/constants/leather-docs';

import { FooterLayout as Footer } from './footer.layout';

// The site footer, shared by the app and marketing pages.
function AppFooter() {
  return (
    <Footer>
      <Footer.Grid>
        <Footer.Column title="Dive deeper">
          <Footer.Link withIcon href={LEATHER_DOCS.guides}>
            Help Center
          </Footer.Link>
          <Footer.InternalLink to="/changelog">Changelog</Footer.InternalLink>
          <Footer.Link withIcon href={LEATHER_DOCS.blog}>
            Blog
          </Footer.Link>
          <Footer.Link withIcon href={LEATHER_DOCS.developers}>
            Developer Docs
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Legal & policies">
          <Footer.InternalLink to="/privacy-policy">Privacy policy</Footer.InternalLink>
          <Footer.InternalLink to="/terms">Terms of service</Footer.InternalLink>
          <Footer.Link href={`${LEATHER_DOCS.guides}/wallet-and-security/security`}>
            Security
          </Footer.Link>
          <Footer.Link href="https://trustmachines.notion.site/Public-assets-00144dc5c69142199b00788ff61d721c">
            Brand assets
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Stay in touch">
          <Footer.Link withIcon href="https://twitter.com/leatherbtc">
            X
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
        mt="space.08"
        product="A Trust Machines product"
        // No year: Cloudflare Workers renders new Date() as epoch start time, and a hard-coded
        // year goes stale.
        copyright="© Leather Wallet LLC"
      />
    </Footer>
  );
}
export { AppFooter as Footer };
