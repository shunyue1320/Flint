import { Val } from "value-enhancer";
import { SideEffectManager } from "side-effect-manager";
import { IServiceVideoChatAvatar, IServiceVideoChatRole } from "@netless/flint-services";
import type { AgoraRTCWeb } from "./agora-rtc-web";

export interface RTCAvatarConfig {
  rtc: AgoraRTCWeb;
  element?: HTMLElement | null;
}

export class RTCLocalAvatar implements IServiceVideoChatAvatar {
  // 录音音量起伏在 0.00001 内忽略不计
  private static LOW_VOLUME_LEVEL_THRESHOLD = 0.00001;

  private readonly _rtc: AgoraRTCWeb;
  private readonly _sideEffect = new SideEffectManager();

  // 控制 摄像机 麦克风 设备的打开与关闭
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

    // _sideEffect.addDisposer 收集返回的effect副作用函数，卸载时一并取消订阅
    this._sideEffect.addDisposer(
      // 订阅麦克风状态改变
      this._shouldMic$.subscribe(async shouldMic => {
        this._volumeLevel = 0;

        try {
          let localMicTrack = this._rtc.localMicTrack;

          // 打开麦克风 并且 当前没有打开过麦克风
          if (shouldMic && !localMicTrack) {
            localMicTrack = await this._rtc.createLocalMicTrack();
          }

          // 如果麦克风轨道存在则调研他只身方法来开启与关闭，避免多次打开关闭流销毁性能
          if (localMicTrack) {
            await localMicTrack.setEnabled(shouldMic);
          }

          // 打开麦克风 并且 当前麦克风已经打开
          if (shouldMic && localMicTrack) {
            await this._rtc.setRole(IServiceVideoChatRole.Host); // 变成主办方
            await this._rtc.client?.publish(localMicTrack);
          } else {
            // 关闭麦克风逻辑：取消发布, 角色变成观众
            await this._rtc.client?.unpublish(localMicTrack);
            if (!this._shouldCamera$.value) {
              await this._rtc.setRole(IServiceVideoChatRole.Audience); // 变成观众
            }
          }

          const lowVolumeLevelDisposerID = "local-mic-volume-level";

          // 打开麦克风需时刻读取麦克风录音 音量大小
          if (shouldMic) {
            let lowVolumeLevelCount = 0;
            this._sideEffect.setInterval(
              () => {
                if (this._rtc.localMicTrack) {
                  try {
                    const volumeLevel = this._rtc.localMicTrack.getVolumeLevel() || 0;
                    if (Math.abs(this._volumeLevel - volumeLevel) > 0.00001) {
                      this._volumeLevel = volumeLevel;
                      // 告诉 AgoraRTCWeb 音量改变了
                      this._rtc.events.emit("volume-level-changed", volumeLevel);
                    }
                    if (volumeLevel <= RTCLocalAvatar.LOW_VOLUME_LEVEL_THRESHOLD) {
                      // 连续录音 5 秒钟，录音音量小于最小值则报错提示
                      if (++lowVolumeLevelCount >= 10) {
                        this._rtc.events.emit("err-low-volume");
                        this._sideEffect.flush(lowVolumeLevelDisposerID);
                        return;
                      }
                    } else {
                      lowVolumeLevelCount = 0;
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
                lowVolumeLevelCount = 0;
              },
              500,
              lowVolumeLevelDisposerID,
            );
          } else {
            this._sideEffect.flush(lowVolumeLevelDisposerID);
          }
        } catch (e) {
          this._rtc.events.emit("err-set-mic", e);
        }
      }),
    );

    // 订阅摄像机状态改变
    this._sideEffect.addDisposer(
      this._shouldCamera$.subscribe(async shouldCamera => {
        try {
          let localCameraTrack = this._rtc.localCameraTrack;

          // 打开摄像头 并且 当前没有打开过摄像头
          if (shouldCamera && !localCameraTrack) {
            localCameraTrack = await this._rtc.createLocalCameraTrack();
            // 设置视频dom挂载点
            if (this._el$.value) {
              localCameraTrack.play(this._el$.value);
            }
          }

          if (localCameraTrack) {
            await localCameraTrack.setEnabled(shouldCamera);
          }

          if (shouldCamera && localCameraTrack) {
            await this._rtc.setRole(IServiceVideoChatRole.Host);
            await this._rtc.client?.publish(localCameraTrack);
          } else {
            // 关闭摄像头逻辑：取消发布, 角色变成观众
            await this._rtc.client?.unpublish(localCameraTrack);
            if (!this._shouldMic$.value) {
              await this._rtc.setRole(IServiceVideoChatRole.Audience);
            }
          }
        } catch (e) {
          this._rtc.events.emit("err-set-camera", e);
        }
      }),
    );

    // _el$改变时摄像视频切换新dom渲染
    this._sideEffect.addDisposer(
      // Val 的 reaction 表示订阅时不触发回调，_el$改变时触发
      this._el$.reaction(async el => {
        if (el && this._rtc.localCameraTrack) {
          try {
            this._rtc.localCameraTrack.play(el);
            await this._rtc.localCameraTrack.setEnabled(this._shouldCamera$.value);
            if (this._shouldCamera$.value) {
              await this._rtc.setRole(IServiceVideoChatRole.Host);
              await this._rtc.client?.publish(this._rtc.localCameraTrack);
            } else {
              // 关闭摄像头逻辑：取消发布, 角色变成观众
              await this._rtc.client?.unpublish(this._rtc.localCameraTrack);
              if (!this._shouldMic$.value) {
                await this._rtc.setRole(IServiceVideoChatRole.Audience);
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }),
    );

    // 收集销毁时需要关闭流的副作用函数， flushAll触发时关闭所有流
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
