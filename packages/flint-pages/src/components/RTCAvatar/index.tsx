import React from "react";
import {
  VideoAvatar,
  VideoAvatarProps,
  VideoAvatarAbsent,
  VideoAvatarAbsentProps,
} from "@netless/flint-components";
import { AvatarCanvas, AvatarCanvasProps } from "./AvatarCanvas";

export type RTCAvatarProps = Omit<VideoAvatarProps, "getVolumeLevel" | "avatarUser"> &
  VideoAvatarAbsentProps &
  AvatarCanvasProps;

export const RTCAvatar: React.FC<RTCAvatarProps> = ({
  userUUID,
  avatarUser,
  rtcAvatar,
  isAvatarUserCreator,
  small,
  isCreator,
  updateDeviceState,
}) => {
  // 用户视频画面
  return avatarUser ? (
    <AvatarCanvas avatarUser={avatarUser} rtcAvatar={rtcAvatar}>
      {/* 子组件是一个方法 */}
      {(getVolumeLevel, canvas) => (
        <VideoAvatar
          avatarUser={avatarUser}
          getVolumeLevel={getVolumeLevel}
          isCreator={isCreator}
          small={small}
          updateDeviceState={updateDeviceState}
          userUUID={userUUID}
        >
          {canvas}
        </VideoAvatar>
      )}
    </AvatarCanvas>
  ) : (
    <VideoAvatarAbsent
      avatarUser={avatarUser}
      isAvatarUserCreator={isAvatarUserCreator}
      small={small}
    />
  );
};
