import type { FlatRTC } from "@netless/flat-rtc";
import { FlatRTCAgoraWeb } from "@netless/flat-rtc-agora-web";

export function initFlatRTC(): void {
  FlatRTCAgoraWeb.APP_ID = process.env.AGORA_APP_ID;
}

// get 去取 flat-rtc-agora-web 内取 getInstance 没有就 new 一个，第一次没有会 new 一个实例
export const getFlatRTC: () => FlatRTC = FlatRTCAgoraWeb.getInstance;
