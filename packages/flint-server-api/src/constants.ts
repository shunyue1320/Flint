export const FLAT_SERVER_PROTOCOL = `https://${process.env.FLAT_SERVER_DOMAIN}`;
export const FLAT_SERVER_BASE_URL_V1 = `https://${process.env.FLAT_SERVER_DOMAIN}/v1`;

export const FLAT_SERVER_VERSIONS = {
  V1: `${FLAT_SERVER_PROTOCOL}/v1`,
} as const;

export const FLAT_SERVER_LOGIN = {
  WECHAT_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/weChat/web/callback`,
  GITHUB_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/github/callback`,
  GOOGLE_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/google/callback`,
  AGORA_CALLBACK: `${FLAT_SERVER_VERSIONS.V1}/login/agora/callback`,
};

export enum Status {
  NoLogin = -1,
  Success,
  Failed,
  Process,
  AuthFailed,
}

export enum Region {
  CN_HZ = "cn-hz",
  US_SV = "us-sv",
  SG = "sg",
  IN_MUM = "in-mum",
  GB_LON = "gb-lon",
}

export enum RoomType {
  OneToOne = "OneToOne",
  SmallClass = "SmallClass",
  BigClass = "BigClass",
}

export enum RoomStatus {
  Idle = "Idle",
  Started = "Started",
  Paused = "Paused",
  Stopped = "Stopped",
}

export enum FileConvertStep {
  None = "None",
  Converting = "Converting",
  Done = "Done",
  Failed = "Failed",
}

export enum Week {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}
