export function isFeatureEnabled() {
  return process.env.NODE_ENV === 'development';
}
