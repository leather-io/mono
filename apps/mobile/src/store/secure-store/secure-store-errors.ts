import { isError } from '@leather.io/utils';

const secureStoreUserCancelledMessagePattern = /User canceled the (operation|authentication)/;

export function isSecureStoreUserCancelledError(error: unknown) {
  return isError(error) && secureStoreUserCancelledMessagePattern.test(error.message);
}
