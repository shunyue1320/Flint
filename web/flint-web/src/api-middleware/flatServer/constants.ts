import { FLAT_SERVER_DOMAIN } from "../../constants/process";

const FLAT_SERVER_PROTOCOL = `https://${FLAT_SERVER_DOMAIN}`;

export const FLAT_SERVER_VERSIONS = {
  V1: `${FLAT_SERVER_PROTOCOL}/v1`,
} as const;

export enum Status {
  NoLogin = -1,
  Success,
  Failed,
  Process,
  AuthFailed,
}
