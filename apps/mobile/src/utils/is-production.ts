export function isProduction() {
  return process.env.EXPO_PUBLIC_NODE_ENV === 'production';
}
