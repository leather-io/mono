import { FooterLayout as Footer } from './footer.layout';

function AppFooter() {
  return (
    <Footer>
      <Footer.Grid>
        <Footer.LeatherIcon />

        <Footer.Column title="Stay in touch">
          <Footer.Link withIcon href="https://twitter.com/leatherbtc">
            X
          </Footer.Link>
          <Footer.Link withIcon href="https://discord.gg/leatherwallet">
            Discord
          </Footer.Link>
          <Footer.Link withIcon href="https://www.youtube.com/@Leather-io">
            Youtube
          </Footer.Link>
          <Footer.Link withIcon href="https://github.com/leather-io">
            Github
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Legal & Policies">
          <Footer.Link href="https://leather.io/privacy-policy">Privacy Policy</Footer.Link>
          <Footer.Link href="https://leather.io/terms">Terms of Service</Footer.Link>
          <Footer.Link href="https://trustmachines.notion.site/Public-assets-00144dc5c69142199b00788ff61d721c">
            Brand assets
          </Footer.Link>
        </Footer.Column>

        <Footer.Column title="Earn">
          {/* 
            TODO: Add links to the following pages
          */}
          <Footer.Link href="">Pool administration</Footer.Link>
          <Footer.Link href="">Signer key signature</Footer.Link>
          <Footer.Link href="">Stack independently</Footer.Link>
        </Footer.Column>
      </Footer.Grid>

      <Footer.Disclaimer>
        This website provides the interface to connect with a directory of yield and Stacking
        service providers. We do not provide the Stacking service ourselves or operate the protocols
        that provide yield. Read our Guide and review our Terms to learn more.
      </Footer.Disclaimer>

      <Footer.LegalText
        product="A Trust Machines product"
        // Hard coding date as Cloudflare Workers renders new Date() as epoch
        // start time
        copyright="© 2025 Leather Wallet, LLC"
      />
    </Footer>
  );
}
export { AppFooter as Footer };
