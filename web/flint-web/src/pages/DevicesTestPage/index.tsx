import "./style.less";
import React, { useState, useContext, useEffect, useRef } from "react";
import { FlatRTCDevice } from "@netless/flat-rtc";
import { DeviceTestPanel } from "flint-components";

import { FlatRTCContext } from "../../components/FlatRTCContext";
import { useSafePromise } from "../../utils/hooks/lifecycle";

export const DevicesTestPage: React.FC = () => {
  console.log("FlatRTCContext==", FlatRTCContext);
  const rtc = useContext(FlatRTCContext);
  const sp = useSafePromise();

  const cameraVideoStreamRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState(0);

  useEffect(() => {
    console.log("rtc====", rtc);
    const avatar = rtc.getTestAvatar();
    console.log("avatar====", avatar);
    if (avatar) {
      avatar.enableCamera(true);
      avatar.enableMic(true);
      avatar.setElement(cameraVideoStreamRef.current);

      const ticket = window.setInterval(() => {
        // add noise
        setVolume(Math.min(avatar.getVolumeLevel() + Math.random() * 0.05, 1));
      }, 50);

      return () => {
        window.clearInterval(ticket);
        avatar.destroy();
      };
    }
    return;
  }, [rtc, cameraVideoStreamRef]);

  return (
    <div className="device-test-page-container">
      <div className="device-test-panel-box">
        <DeviceTestPanel microphoneVolume={volume} />
      </div>
    </div>
  );
};

export default DevicesTestPage;
