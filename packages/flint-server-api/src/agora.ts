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
