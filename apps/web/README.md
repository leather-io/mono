# Leather.io Web App

Home of Leather's web app, built with [React Router v7](https://reactrouter.com/) in framework mode.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Deployment

Site is deployed on Cloudflare workers. See [deployment workflow](../../../.github/workflows/deploy-web.yml) for details.

## Universal Content Sanitization

Dynamic HTML content is sanitized using a universal utility (`sanitizeContent`).
- **Client (browser):** Uses DOMPurify for robust XSS protection.
- **SSR/Cloudflare Workers:** Uses a simple string-based sanitizer (removes <script> tags) for compatibility, since DOMPurify/JSDOM are not available in Workers.

**Note:** For maximum security, always sanitize untrusted content on the client. SSR sanitization is basic and should not be solely relied upon for untrusted sources.

### Migration from isomorphic-dompurify
- `isomorphic-dompurify` and JSDOM-based SSR sanitization have been removed for full Cloudflare compatibility.
- All imports of the old sanitizer now use the new universal utility.
