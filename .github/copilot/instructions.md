# GitHub Copilot Instructions for Leather apps/web

## Project Overview
This is the web application for Leather, a crypto wallet. The project is built using:
- TypeScript
- React
- Vite
- Panda CSS
- Cloudflare for SSR

## Coding Conventions

### TypeScript
- Use TypeScript for type safety
- Use array notation with `Type[]` instead of `Array<Type>`
- Explicitly type function parameters and return values
- Use interfaces for objects that can be extended and types for unions, intersections, or mapped types
- Use type narrowing with type guards when appropriate

### Functions
- Prefer function declarations over const function expressions:
  ```typescript
  // Preferred
  function doSomething(param: string): void {
    // implementation
  }

  // Avoid
  const doSomething = (param: string): void => {
    // implementation
  };
  ```
- Use arrow functions for callbacks or when `this` binding is needed

### React
- Use functional components with hooks
- Extract reusable UI components to the @leather.io/ui package
- Use context for sharing state between components when prop drilling becomes cumbersome
- Follow the container/presentation component pattern when appropriate

### File Organization
- Related components should be kept in the same directory
- Keep component files focused and not too large
- Create separate files for hooks, types, and utilities used by components

### Imports
- Group imports in the following order:
  1. External libraries
  2. Internal packages
  3. Local components and utilities
  4. Assets and styles
- Use absolute imports with the `~` prefix for app-level imports

### Styles
- Use Panda CSS for styling
- Define styles in appropriate style files

## Testing
- Write unit tests for components and utilities
- Use Vitest for testing
- Test business logic thoroughly

## State Management
- Use React Query for remote data fetching
- Use React Context for global state when needed
- Keep state as local as possible

## Error Handling
- Use try/catch blocks for error handling
- Display user-friendly error messages
- Log errors for debugging

## Performance
- Be mindful of unnecessary re-renders
- Use memoization (useMemo, useCallback) when it makes sense
- Optimize bundle size by avoiding large dependencies

## Accessibility
- Use semantic HTML
- Ensure all interactive elements are keyboard accessible
- Use aria attributes when necessary
- Maintain appropriate color contrast

## Routing
- Use React Router for navigation
- Follow the established route structure

## Security
- Never store sensitive information in client-side code
- Validate all user inputs
- Be cautious with third-party libraries

## Documentation
- Document complex functions and components
- Keep comments up to date with code changes
- Add JSDoc comments for public API functions

Remember these instructions when generating or modifying code in the Leather apps/web project.
