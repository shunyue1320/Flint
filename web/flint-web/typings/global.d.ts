declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "production";
    DEV: boolean;
    PROD: boolean;
    VERSION: string;

    NETLESS_APP_IDENTIFIER: string;

    FLAT_DOWNLOAD_URL: string;
    AGORA_APP_ID: string;
  }
}
