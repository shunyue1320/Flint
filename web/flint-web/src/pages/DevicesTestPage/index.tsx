import "./style.less";
import React, { useState, useContext, useEffect, useRef } from "react";
import { FlatRTCDevice } from "@netless/flat-rtc";
import { DeviceTestPanel } from "flint-components";

import { FlatRTCContext } from "../../components/FlatRTCContext";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { DeviceTest } from "../../api-middleware/rtc/device-test";

export const DevicesTestPage: React.FC = () => {
  console.log("FlatRTCContext==", FlatRTCContext);
  const rtc = useContext(FlatRTCContext);
  const sp = useSafePromise();

  const cameraVideoStreamRef = useRef<HTMLDivElement>(null);
  const [cameraDevices, setCameraDevices] = useState<FlatRTCDevice[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<FlatRTCDevice[]>([]);

  const [isCameraAccessible, setIsCameraAccessible] = useState(true);
  const [isMicrophoneAccessible, setIsMicrophoneAccessible] = useState(true);

  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const avatar = rtc.getTestAvatar();
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

  useEffect(() => {
    const handlerDeviceError = (error: any): void => {
      if (DeviceTest.isPermissionError(error)) {
        setIsCameraAccessible(false);
      }
    };

    // 获取所有摄像头设备的 deviceId
    const refreshCameraDevices = (): void => {
      sp(rtc.getCameraDevices())
        .then(devices => {
          const cameraDevices = devices.filter(device => device.deviceId);
          setCameraDevices(cameraDevices);
          setIsCameraAccessible(cameraDevices.length > 0);
        })
        .catch(handlerDeviceError);
    };

    // 获取所有麦克风设备的 deviceId
    const refreshMicDevices = (): void => {
      sp(rtc.getMicDevices())
        .then(devices => {
          const microphoneDevices = devices.filter(device => device.deviceId);
          setMicrophoneDevices(microphoneDevices);
          setIsMicrophoneAccessible(microphoneDevices.length > 0);
        })
        .catch(handlerDeviceError);
    };

    const cameraChangeDisposer = rtc.events.on("camera-changed", refreshCameraDevices);
    const micChangedDisposer = rtc.events.on("mic-changed", refreshMicDevices);

    refreshCameraDevices();
    refreshMicDevices();

    return () => {
      cameraChangeDisposer();
      micChangedDisposer();
    };
  }, [rtc, sp]);

  return (
    <div className="device-test-page-container">
      <div className="device-test-panel-box">
        <DeviceTestPanel
          cameraDevices={cameraDevices}
          microphoneDevices={microphoneDevices}
          microphoneVolume={volume}
        />
      </div>
    </div>
  );
};

export default DevicesTestPage;
