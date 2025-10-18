/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIR_PARTNER_ID: string;
  readonly VITE_AIR_ENV: string;
  readonly VITE_AIR_ISSUER_DID: string;
  readonly VITE_AIR_VERIFIER_DID: string;
  readonly VITE_MOCA_CHAIN_ID: string;
  readonly VITE_MOCA_RPC_URL: string;
  readonly VITE_EXPLORER_BASE_URL: string;
  readonly VITE_PARTNER_TOKEN_URL: string;
  readonly VITE_ISSUER_PROGRAM_IDS: string;
  readonly VITE_VERIFIER_PROGRAM_IDS: string;
  readonly VITE_AIRGATE_BRAND: string;
  readonly VITE_AIRGATE_CONTACT_EMAIL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_REDIRECT_URL: string;
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
