export function isDev() {
  return process.env.EXPO_PUBLIC_NODE_ENV === 'development';
}
