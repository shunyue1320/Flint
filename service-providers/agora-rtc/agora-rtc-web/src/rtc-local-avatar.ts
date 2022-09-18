import { Val } from "value-enhancer";
import { SideEffectManager } from "side-effect-manager";
import { IServiceVideoChatAvatar } from "@netless/flint-services";
import type { AgoraRTCWeb } from "./agora-rtc-web";

export interface RTCAvatarConfig {
  rtc: AgoraRTCWeb;
  element?: HTMLElement | null;
}

export class RTCLocalAvatar implements IServiceVideoChatAvatar {
  private static LOW_VOLUME_LEVEL_THRESHOLD = 0.00001;

  private readonly _rtc: AgoraRTCWeb;
  private readonly _sideEffect = new SideEffectManager();

  private readonly _shouldCamera$ = new Val(false);
  private readonly _shouldMic$ = new Val(false);

  private _volumeLevel = 0;

  private readonly _el$: Val<HTMLElement | undefined | null>;

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

  public constructor(config: RTCAvatarConfig) {
    this._rtc = config.rtc;
    this._el$ = new Val(config.element);

    // 订阅麦克风轨道
    this._sideEffect.addDisposer(
      this._shouldMic$.subscribe(async shouldMic => {
        this._volumeLevel = 0;

        try {
          const localMicTrack = this._rtc.localMicTrack;
          console.log("localMicTrack=====", localMicTrack);
        } catch (e) {
          this._rtc.events.emit("err-set-mic", e);
        }
      }),
    );

    // 订阅摄像机轨道
    this._sideEffect.addDisposer(
      this._shouldCamera$.subscribe(async shouldCamera => {
        try {
          const localCameraTrack = this._rtc.localCameraTrack;
          console.log("localCameraTrack=====", localCameraTrack);
        } catch (e) {
          this._rtc.events.emit("err-set-camera", e);
        }
      }),
    );

    // 摄像机轨迹渲染节点
    this._sideEffect.addDisposer(
      this._el$.reaction(async el => {
        if (el && this._rtc.localCameraTrack) {
          try {
            this._rtc.localCameraTrack.play(el);
          } catch (e) {
            console.error(e);
          }
        }
      }),
    );

    // 轨道设置状态不启用
    this._sideEffect.addDisposer(async () => {
      try {
        await this._rtc.localCameraTrack?.setEnabled(false);
        await this._rtc.localMicTrack?.setEnabled(false);
      } catch {
        // do nothing
      }
    });
  }

  public destroy(): void {
    this._sideEffect.flushAll();
  }
}
