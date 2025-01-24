// TODO - accept message as obj and then add disabling of no strings as super annoying
export function logger(message: string, ...optionalParams: any[]) {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(message, ...optionalParams);
  }
}
