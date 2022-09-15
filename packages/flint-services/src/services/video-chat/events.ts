// import type { Remitter } from "remitter";

export type IServiceVideoChatNetworkQualityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// 服务视频聊天事件数据
export interface IServiceVideoChatEventData {
  network: {
    delay: number;
    uplink: IServiceVideoChatNetworkQualityType;
    downlink: IServiceVideoChatNetworkQualityType;
  };
  "network-test": IServiceVideoChatNetworkQualityType;
  /** 音量级别更改时触发 */
  "volume-level-changed": number;
  /** 添加或删除音频采样设备时触发 */
  "camera-changed": string;
  /** 添加或删除音频播放设备时触发 */
  "speaker-changed": string;

  "err-set-camera": Error;
  "err-set-mic": Error;
  "err-low-volume": undefined;
  error: Error;
}
