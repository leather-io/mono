# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm run start` - Start Expo development server
- `pnpm run ios` - Run on iOS simulator (requires XCode, CocoaPods)
- `pnpm run android` - Run on Android emulator
- `pnpm run storybook` - Run Storybook for component development

### Build & Type Checking
- `pnpm run build` - TypeScript build
- `pnpm run typecheck` - Type checking without emit
- `pnpm run build:watch` - Watch mode TypeScript build

### Testing & Quality
- `pnpm run test:unit` - Run unit tests with Vitest
- `pnpm run test:coverage` - Run tests with coverage
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting
- `pnpm run knip` - Find unused dependencies and exports

### Internationalization
- `pnpm run lingui:extract` - Extract translatable strings
- `pnpm run lingui:compile` - Compile translations
- `pnpm run lingui:watch` - Watch mode for translations

### Setup Requirements
- Run `pnpm run 1password:env:dev` to setup .env file (requires 1Password CLI)
- Run `pnpm run firebase` to configure Firebase for push notifications
- iOS development requires CocoaPods: `pnpm run check:cocoapods`

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **State Management**: Redux Toolkit + React Query (TanStack Query)
- **Navigation**: Expo Router (file-based routing) + React Navigation
- **UI**: Custom design system (`@leather.io/ui`) with Restyle
- **Blockchain**: Bitcoin (bitcoinjs-lib) + Stacks (@stacks/transactions)
- **Security**: Expo SecureStore, biometric auth, hardware wallet support

### Project Structure
```
src/
├── app/                    # Expo Router pages (file-based routing)
├── core/                   # App-level providers and configuration
├── features/               # Feature modules (account, send, receive, browser, etc.)
├── components/             # Shared UI components
├── queries/                # React Query hooks and blockchain clients
├── store/                  # Redux state (wallets, accounts, keychains, settings)
├── hooks/                  # Custom React hooks
├── services/               # App services and initialization
└── shared/                 # Constants, types, utilities
```

### Key Features
- **Multi-blockchain wallet**: Bitcoin and Stacks support
- **dApp browser**: WebView-based with RPC communication
- **Hardware wallet integration**: PSBT signing support
- **Multi-signature support**: Advanced transaction signing
- **Internationalization**: LinguiJS with Crowdin integration

### State Architecture
- **Redux**: Global app state (wallets, accounts, settings)
- **React Query**: Server state, caching, and blockchain data
- **Expo SecureStore**: Encrypted keychain storage
- **AsyncStorage**: App preferences and non-sensitive data

### Navigation Patterns
- **File-based routing**: Expo Router in `app/` directory
- **Sheet-based modals**: Global sheets for send/receive flows
- **Provider patterns**: Flow state management for complex interactions

### Development Notes
- Part of a monorepo with shared packages (`@leather.io/*`)
- Feature-based organization with domain-driven modules
- Uses Maestro for E2E testing
- Firebase for push notifications and analytics
- Sentry for error tracking and performance monitoring

### Testing
- **Unit tests**: Vitest with TypeScript support
- **E2E tests**: Maestro flows in `maestro/` directory
- **Component testing**: Storybook for isolated component development

### Security Considerations
- Secure keychain storage with biometric unlock
- Hardware wallet integration via PSBT
- Permission-based dApp interactions
- Multi-signature transaction support

## Development Guidelines

### Commit Message Format
Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

**Examples:**
```
feat(send): add QR code scanning for recipient addresses
fix(fingerprint): exclude dynamic Firebase files from build fingerprinting
docs(readme): update installation instructions
chore(deps): update expo to 53.0.18
```