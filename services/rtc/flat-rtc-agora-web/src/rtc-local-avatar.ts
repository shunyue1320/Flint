import type { FlatRTCAvatar } from "@netless/flat-rtc";
import type { FlatRTCAgoraWeb } from "./flat-rtc-agora-web";

export interface RTCAvatarConfig {
  rtc: FlatRTCAgoraWeb;
  element?: HTMLElement | null;
}

export class RTCLocalAvatar implements FlatRTCAvatar {
  private readonly _rtc: FlatRTCAgoraWeb;

  private _volumeLevel = 0;

  public constructor(config: RTCAvatarConfig) {
    this._rtc = config.rtc;
  }

  public enableCamera(): void {
    console.log("destroy");
  }
  public enableMic(): void {
    console.log("destroy");
  }
  public setElement(): void {
    console.log("destroy");
  }
  public getVolumeLevel(): number {
    return this._volumeLevel;
  }
  public destroy(): void {
    console.log("destroy");
  }
}
