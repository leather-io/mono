export interface Environment {
  environment: string;
  leatherApiUrl?: string;
  sponsorshipApiUrl?: string;
  bitflow?: {
    bitflowApiHost: string;
    bitflowApiKey: string;
    bitflowProviderAddress: string;
    keeperApiKey: string;
    keeperApiHost: string;
  };
}
