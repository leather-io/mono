export interface Environment {
  environment: string;
  leatherApiUrl?: string;
  bitflow?: {
    bitflowApiHost: string;
    bitflowApiKey: string;
    bitflowProviderAddress: string;
    keeperApiKey: string;
    keeperApiHost: string;
  };
}
