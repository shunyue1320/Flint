import AgoraRTC from "agora-rtc-sdk-ng";
import type { IRemoteVideoTrack, IAgoraRTCClient, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { SideEffectManager } from "side-effect-manager";
import { Val } from "value-enhancer";

import { IServiceShareScreen } from "@netless/flat-services";

export interface AgoraRTCWebShareScreenAvatarConfig {
  APP_ID: string;
  element?: HTMLElement | null;
}

/** 创建 AgoraRTC 客户端 client */
export class AgoraRTCWebShareScreen extends IServiceShareScreen {
  private readonly APP_ID: string;
  private readonly _sideEffect = new SideEffectManager();

  // 远程视频跟踪
  private readonly _remoteVideoTrack$ = new Val<IRemoteVideoTrack | null>(null);
  private readonly _el$: Val<HTMLElement | null>;

  // 客户端
  public readonly client: IAgoraRTCClient;
  // 本地音频轨道
  public localVideoTrack: ILocalVideoTrack | null = null;

  // 远程视频轨道
  public remoteVideoTrack: IRemoteVideoTrack | null = null;

  public constructor(config: AgoraRTCWebShareScreenAvatarConfig) {
    super();
    this.APP_ID = config.APP_ID;
    // 创建声网 rtc 客户端
    this.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
    this._el$ = new Val(config.element ?? null);

    this._sideEffect.addDisposer(
      this._remoteVideoTrack$.subscribe(remoteVideoTrack => {
        // 远程视频轨道没有 替换本地视频轨道
        if (remoteVideoTrack) {
          if (this.remoteVideoTrack) {
            this.remoteVideoTrack.stop();
          }
          this.remoteVideoTrack = remoteVideoTrack;
          if (this._el$.value && !this.localVideoTrack) {
            this.remoteVideoTrack.play(this._el$.value);
          }
          this.events.emit("remote-changed", true);

          // 远程视频轨道没有 && 本地有 则关闭本地视频轨道
        } else if (this.remoteVideoTrack) {
          this.remoteVideoTrack.stop();
          this.remoteVideoTrack = null;
          this.events.emit("remote-changed", false);
        }
      }),
    );
  }
}
