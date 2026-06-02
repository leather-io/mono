export interface SignInMessage {
  message: string;
  timestamp: number;
}

export function buildSignInMessage(
  timestamp: number = Math.floor(Date.now() / 1000)
): SignInMessage {
  return {
    message: `Sign in to Leather\n${timestamp}`,
    timestamp,
  };
}
