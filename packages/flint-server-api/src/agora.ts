import { post } from "./utils";

export interface GenerateRTCTokenPayload {
  roomUUID: string;
}
export interface GenerateRTCTokenResult {
  token: string;
}
export async function generateRTCToken(roomUUID: string): Promise<string> {
  const { token } = await post<GenerateRTCTokenPayload, GenerateRTCTokenResult>(
    "agora/token/generate/rtc",
    { roomUUID },
  );

  return token;
}

export type GenerateRTMTokenPayload = void;
export type GenerateRTMTokenResult = {
  token: string;
};
export async function generateRTMToken(): Promise<string> {
  const { token } = await post<GenerateRTMTokenPayload, GenerateRTMTokenResult>(
    "agora/token/generate/rtm",
    undefined,
  );
  return token;
}
