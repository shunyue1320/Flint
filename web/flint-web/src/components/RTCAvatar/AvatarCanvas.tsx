import "./AvatarCanvas.less";

import React, { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { FlatRTCAvatar } from "@netless/flat-rtc";

import { User } from "../../stores/class-room-store";

export interface AvatarCanvasProps {
  // 该头像的用户
  avatarUser?: User | null;
  rtcAvatar?: FlatRTCAvatar | null;
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

  const canvas = <div ref={setCanvasEl} className="video-avatar-canvas" />;

  return children(getVolumeLevel, canvas);
});
