import { IServiceVideoChatAvatar } from "@netless/flint-services";

export interface RTCAvatarConfig {
  rtc: AgoraRTCWeb;
  element?: HTMLElement | null;
}

export class RTCLocalAvatar implements IServiceVideoChatAvatar {
  public constructor(config: RTCAvatarConfig) { }
}
