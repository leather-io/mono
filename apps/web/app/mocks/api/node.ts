import { setupServer } from 'msw/node';

// With an SSR framework, mocks should also run in the node environment such
// that initial responses also contain mocked response data. It hasn't been
// possible to get this working, however for now it doesn't greatly impact our
// ability to test the app. Ought to be `setupServer(...successHandlers);`
export const server = setupServer();
