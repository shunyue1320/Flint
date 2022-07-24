import AgoraRTC, { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

export class DeviceTest {
  public static isPermissionError(error: any): error is Error {
    return "code" in error && "message" in error && error.code === "PERMISSION_DENIED";
  }
}
