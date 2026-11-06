import { FooterLayout as Footer } from './footer.layout';

// The single site footer (app + marketing pages), merged from the retired Framer site's footer.
function AppFooter() {
  return (
    <Footer>
      <Footer.Grid>
        <Footer.Column title="Dive deeper">
          <Footer.InternalLink to="/support">Help Center</Footer.InternalLink>
          <Footer.InternalLink to="/changelog">Changelog</Footer.InternalLink>
          <Footer.InternalLink to="/news">News</Footer.InternalLink>
          <Footer.Link withIcon href="https://leather.gitbook.io/">
            Developer Docs
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Legal & policies">
          <Footer.InternalLink to="/posts/privacy-policy">Privacy policy</Footer.InternalLink>
          <Footer.InternalLink to="/posts/terms-of-service">Terms of service</Footer.InternalLink>
          <Footer.InternalLink to="/support/security">Security</Footer.InternalLink>
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
        // year goes stale. Matches the Framer site's footer.
        copyright="© Leather Wallet LLC"
      />
    </Footer>
  );
}
export { AppFooter as Footer };
