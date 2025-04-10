# Leather.io Web App

Home of Leather's web app, built with [React Router v7](https://reactrouter.com/) in framework mode.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Environment Variables

- `BUILD_TARGET`: Controls build configuration. When set to `'pull-request'`, server-side rendering is disabled to optimize PR preview builds.

## Deployment

### Production Deployment
Deployments to production are handled automatically when changes are merged to the `dev` branch.

### PR Preview Deployments
Every pull request automatically creates a preview deployment with server-side rendering disabled for faster builds and previews.
