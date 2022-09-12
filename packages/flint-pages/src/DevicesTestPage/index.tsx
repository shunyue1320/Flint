import "./style.less";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { DeviceTestPanel } from "@netless/flint-components";
import { IServiceVideoChatDevice } from "@netless/flint-services";

import { useSafePromise } from "../utils/hooks/lifecycle";
import { GlobalStoreContext, PreferencesStoreContext } from "../components/StoreProvider";
import { joinRoomHandler } from "../utils/join-room-handler";
import { RouteNameType, RouteParams, usePushNavigate } from "../utils/routes";
import { useFlintService } from "../components/FlintServicesContext";

export const DevicesTestPage: React.FC = () => {
  const rtc = useFlintService("videoChat");
  const globalStore = useContext(GlobalStoreContext);
  const sp = useSafePromise();
  const pushNavigate = usePushNavigate();

  const { roomUUID } = useParams<RouteParams<RouteNameType.JoinPage>>();

  const cameraVideoStreamRef = useRef<HTMLDivElement>(null);
  const [cameraDevices, setCameraDevices] = useState<IServiceVideoChatDevice[]>([]);
  const [microphoneDevices, setMicrophoneDevices] = useState<IServiceVideoChatDevice[]>([]);

  const [cameraDeviceId, setCameraDeviceId] = useState<string>("");
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string>("");

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
    if (!rtc) {
      return;
    }

    const handlerDeviceError = (error: any): void => {
      setIsCameraAccessible(false);
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

    // 监听设备改变重新获取所有设备id
    const cameraChangeDisposer = rtc.events.on("camera-changed", refreshCameraDevices);
    const micChangedDisposer = rtc.events.on("mic-changed", refreshMicDevices);

    refreshCameraDevices();
    refreshMicDevices();

    return () => {
      cameraChangeDisposer();
      micChangedDisposer();
    };
  }, [rtc, sp]);

  // 检查摄像头更改时的设备id
  useEffect(() => {
    if (cameraDevices.length > 0 && !cameraDeviceId) {
      const lastCameraId = PreferencesStoreContext.cameraId;
      // 默认设置第一个设备id
      lastCameraId ? setCameraDeviceId(lastCameraId) : setCameraDeviceId(cameraDevices[0].deviceId);
    }
  }, [cameraDeviceId, cameraDevices]);

  // 检查麦克风更改时的设备id
  useEffect(() => {
    if (microphoneDevices.length > 0 && !microphoneDeviceId) {
      const lastMicrophoneId = PreferencesStoreContext.microphoneId;
      lastMicrophoneId
        ? setMicrophoneDeviceId(lastMicrophoneId)
        : setMicrophoneDeviceId(microphoneDevices[0].deviceId);
    }
  }, [microphoneDeviceId, microphoneDevices]);

  const joinRoom = async (): Promise<void> => {
    PreferencesStoreContext.updateCameraId(cameraDeviceId);
    PreferencesStoreContext.updateMicrophoneId(microphoneDeviceId);
    await joinRoomHandler(roomUUID, pushNavigate);
  };

  return (
    <div className="device-test-page-container">
      <div className="device-test-panel-box">
        <DeviceTestPanel
          cameraDevices={cameraDevices}
          cameraVideoStreamRef={cameraVideoStreamRef}
          currentCameraDeviceID={cameraDeviceId}
          currentMicrophoneDeviceID={microphoneDeviceId}
          currentSpeakerDeviceID={"default browser"}
          isCameraAccessible={isCameraAccessible}
          isMicrophoneAccessible={isMicrophoneAccessible}
          isSpeakerAccessible={true}
          joinRoom={joinRoom}
          microphoneDevices={microphoneDevices}
          microphoneVolume={volume}
          setCameraDevice={setCameraDeviceId}
          setMicrophoneDevice={setMicrophoneDeviceId}
          // 目前，浏览器不支持切换扬声器设备
          setSpeakerDevice={() => null}
          speakerTestFileName={"Music"}
          toggleDeviceTest={() => globalStore.toggleDeviceTest()}
        />
      </div>
    </div>
  );
};

export default DevicesTestPage;
