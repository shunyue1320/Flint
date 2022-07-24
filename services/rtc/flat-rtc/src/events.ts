import Emittery from "emittery";

// *网络质量类型：
// *
// *-0：网络质量未知。
// *-1：网络质量非常好。
// *-2：网络质量相当好，但比特率可能略低于优秀。
// *-3：用户可以感觉到通信轻微受损。
// *-4：用户无法顺利沟通。
// *-5：网络太差了，用户几乎无法通信。
// *-6：网络关闭，用户根本无法通信。
// *-7：用户无法检测网络质量。
// *-8：检测网络质量。
export type FlatRTCNetworkQualityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface FlatRTCEventData {
  network: {
    delay: number;
    uplink: FlatRTCNetworkQualityType;
    downlink: FlatRTCNetworkQualityType;
  };
  "network-test": FlatRTCNetworkQualityType;
  "volume-level-changed": number;

  // 添加或删除视频捕获设备时
  "camera-changed": string;
  // 添加或删除音频采样设备时
  "mic-changed": string;
  // 添加或删除音频播放设备时
  "speaker-changed": string;

  "err-set-camera": Error;
  "err-set-mic": Error;
  "err-low-volume": undefined;
  error: Error;
}

export type FlatRTCEventNames = keyof FlatRTCEventData;

export type FlatRTCEvents = Emittery<FlatRTCEventData, FlatRTCEventData>;
