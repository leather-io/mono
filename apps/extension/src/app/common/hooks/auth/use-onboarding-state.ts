import { useAuthRequestParams } from './use-auth-request-params';

export function useOnboardingState() {
  const { authDetails } = useAuthRequestParams();
  const { authRequest, decodedAuthRequest, appName, appIcon, appURL } = authDetails ?? {};

  return {
    authRequest,
    decodedAuthRequest,
    appIcon,
    appName,
    appURL,
  };
}
