export interface Environment {
  environment: string;
  leatherApiUrl?: string;
  bitflow?: {
    bitflowApiHost: string;
    bitflowApiKey: string;
    bitflowProviderAddress: string;
    readonlyCallApiHost: string;
    readonlyCallApiKey: string;
    keeperApiKey: string;
    keeperApiHost: string;
  };
}
