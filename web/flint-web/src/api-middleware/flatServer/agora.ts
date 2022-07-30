import { post } from "./utils";

export interface AgoraCloudRecordStartRequestBody {
  clientRequest: {
    recordingConfig?: {
      channelType?: number;
      streamTypes?: number;
      decryptionMode?: number;
      secret?: string;
      audioProfile?: number;
      videoStreamType?: number;
      maxIdleTime?: number;
      transcodingConfig?: {
        width: number;
        height: number;
        fps: number;
        bitrate: number;
        maxResolutionUid?: string;
        mixedVideoLayout?: number;
        backgroundColor?: string;
        defaultUserBackgroundImage?: string;
        layoutConfig?: Array<{
          uid?: string;
          x_axis?: number;
          y_axis?: number;
          width?: number;
          height?: number;
          alpha?: number;
          render_mode?: number;
        }>;
        backgroundConfig?: Array<{
          uid: string;
          image_url: string;
          render_mode?: number;
        }>;
      };
      subscribeVideoUids?: string[];
      unSubscribeVideoUids?: string[];
      subscribeAudioUids?: string[];
      unSubscribeAudioUids?: string[];
      subscribeUidGroup?: number;
    };
    recordingFileConfig?: {
      avFileType?: string[];
    };
    snapshotConfig?: {
      fileType: string[];
      captureInterval?: number;
    };
    extensionServiceConfig?: {
      extensionServices: Array<{
        serviceName?: string;
        errorHandlePolicy?: string;
        serviceParam?: {
          serviceParam: string;
          secretKey: string;
          regionId: string;
          apiData: {
            videoData: {
              title: string;
              description?: string;
              coverUrl?: string;
              cateId?: string;
              tags?: string;
              templateGroupId?: string;
              userData?: string;
              storageLocation?: string;
              workflowI?: string;
            };
          };
        };
      }>;
      apiVersion?: string;
      errorHandlePolicy?: string;
    };
  };
}

export interface AgoraCloudRecordParamsBaseType {
  resourceid: string;
  mode: "individual" | "mix" | "web";
}

export interface CloudRecordStartPayload {
  roomUUID: string;
  agoraParams: AgoraCloudRecordParamsBaseType;
  agoraData: AgoraCloudRecordStartRequestBody;
}

export interface GenerateRTCTokenPayload {
  roomUUID: string;
}

export type GenerateRTCTokenResult = {
  token: string;
};

// 生成声网 rtc token 令牌
export async function generateRTCToken(roomUUID: string): Promise<string> {
  const { token } = await post<GenerateRTCTokenPayload, GenerateRTCTokenResult>(
    "agora/token/generate/rtc",
    {
      roomUUID,
    },
  );
  return token;
}
