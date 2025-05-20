# Leather.io Web App

Home of Leather's web app, built with [React Router v7](https://reactrouter.com/) in framework mode.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the development server with

```bash
pnpm dev
```

and open `http://localhost:5173`.

## Environments

Site is deployed on Cloudflare workers. See [deployment workflow](../../.github/workflows/deploy-web.yml) for details.

## Universal Content Sanitization

Dynamic HTML content is sanitized using a universal utility (`sanitizeContent`).

- **Client (browser):** Uses DOMPurify for robust XSS protection.
- **SSR/Cloudflare Workers:** Uses a simple string-based sanitizer (removes <script> tags) for compatibility, since DOMPurify/JSDOM are not available in Workers.

**Note:** For maximum security, always sanitize untrusted content on the client. SSR sanitization is basic and should not be solely relied upon for untrusted sources.
