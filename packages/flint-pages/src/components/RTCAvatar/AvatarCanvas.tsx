import "./AvatarCanvas.less";

import React, { useCallback, useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import { IServiceVideoChatAvatar } from "@netless/flint-services";
import { User } from "@netless/flint-stores";

export interface AvatarCanvasProps {
  // 该头像的用户
  avatarUser?: User | null;
  rtcAvatar?: IServiceVideoChatAvatar | null;
}

export const AvatarCanvas = observer<
  AvatarCanvasProps & {
    children: (getVolumeLevel: () => number, canvas: React.ReactNode) => React.ReactElement | null;
  }
>(function AvatarCanvas({ avatarUser, rtcAvatar, children }) {
  const camera = avatarUser?.camera;
  const mic = avatarUser?.mic;

  const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);

  const getVolumeLevel = useCallback((): number => {
    return rtcAvatar?.getVolumeLevel() || 0;
  }, [rtcAvatar]);

  // 为新 rtcAvatar 设置画布
  useEffect(() => {
    if (rtcAvatar) {
      rtcAvatar.setElement(canvasEl);
    }
  }, [canvasEl, rtcAvatar]);

  // rtcAvatar 改变重置状态
  useEffect(
    () => () => {
      if (rtcAvatar) {
        rtcAvatar.setElement(null);
        rtcAvatar.enableCamera(false);
        rtcAvatar.enableMic(false);
      }
    },
    [rtcAvatar],
  );

  // 摄像头 开启/关闭
  useEffect(() => {
    if (rtcAvatar) {
      rtcAvatar.enableCamera(Boolean(camera));
    }
  }, [camera, rtcAvatar]);

  // 麦克风 开启/关闭
  useEffect(() => {
    if (rtcAvatar) {
      rtcAvatar.enableMic(Boolean(mic));
    }
  }, [mic, rtcAvatar]);

  const canvas = <div ref={setCanvasEl} className="video-avatar-canvas" />;

  return children(getVolumeLevel, canvas);
});
