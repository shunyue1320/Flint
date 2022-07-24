import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";

import type { FlatRTCAvatar } from "@netless/flat-rtc";
import type { FlatRTCAgoraWeb } from "./flat-rtc-agora-web";

export interface RTCAvatarConfig {
  rtc: FlatRTCAgoraWeb;
  element?: HTMLElement | null;
}

export class RTCLocalAvatar implements FlatRTCAvatar {
  private readonly _rtc: FlatRTCAgoraWeb;
  private readonly _sideEffect = new SideEffectManager();

  private readonly _shouldCamera$ = new Val(false);
  private readonly _shouldMic$ = new Val(false);

  private readonly _el$: Val<HTMLElement | undefined | null>;

  private _volumeLevel = 0;

  public constructor(config: RTCAvatarConfig) {
    this._rtc = config.rtc;
  }

  public enableCamera(enabled: boolean): void {
    this._shouldCamera$.setValue(enabled);
  }

  public enableMic(enabled: boolean): void {
    this._shouldMic$.setValue(enabled);
  }

  public setElement(el: HTMLElement | null): void {
    this._el$.setValue(el);
  }

  public getVolumeLevel(): number {
    return this._volumeLevel;
  }
  public destroy(): void {
    this._sideEffect.flushAll();
  }
}