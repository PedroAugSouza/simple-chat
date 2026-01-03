export interface OutputGetPlatforms {
  name: string;
  oauthLink: string;
  authorized: boolean;
  description: string;
  icon: string;

  integrationId?: string;
  active?: boolean;
  credentials?: string;
}

export interface InputUpdateIntegration {
  active?: boolean;
  credentials?: string;
}
