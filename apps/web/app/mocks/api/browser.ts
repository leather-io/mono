import { setupWorker } from 'msw/browser';

import { successHandlers } from './mock-handlers';

export const worker = setupWorker(...successHandlers);
