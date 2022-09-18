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
import { useLoginCheck } from "../utils/use-login-check";

export const DevicesTestPage: React.FC = () => {
  const rtc = useFlintService("videoChat");
  const globalStore = useContext(GlobalStoreContext);
  const preferencesStore = useContext(PreferencesStoreContext);
  const sp = useSafePromise();
  const pushNavigate = usePushNavigate();

  useLoginCheck();

  // 拿到路由上要去的房间唯一id roomUUID
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
    if (!rtc) {
      return;
    }

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
        avatar.enableCamera(false);
        avatar.enableMic(false);
        avatar.setElement(null);
      };
    }
    return;
  }, [rtc, cameraVideoStreamRef]);

  useEffect(() => {
    if (!rtc) {
      return;
    }

    const handlerDeviceError = (): void => {
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
      // 取消监听
      cameraChangeDisposer();
      micChangedDisposer();
    };
  }, [rtc, sp]);

  // 设置当前使用 扬声器 设备id
  useEffect(() => {
    if (rtc && cameraDeviceId) {
      void rtc.setCameraID(cameraDeviceId).catch(() => {
        setIsCameraAccessible(false);
      });
    }
  }, [rtc, cameraDeviceId]);

  // 设置当前使用 麦克风 设备id
  useEffect(() => {
    if (rtc && microphoneDeviceId) {
      void rtc.setMicID(microphoneDeviceId).catch(() => {
        setIsMicrophoneAccessible(false);
      });
    }
  }, [rtc, microphoneDeviceId]);

  // 检查摄像头更改时的设备id
  useEffect(() => {
    if (cameraDevices.length > 0 && !cameraDeviceId) {
      const lastCameraId = preferencesStore.cameraId;
      // 默认设置第一个设备id
      lastCameraId ? setCameraDeviceId(lastCameraId) : setCameraDeviceId(cameraDevices[0].deviceId);
    }
  }, [preferencesStore, cameraDeviceId, cameraDevices]);

  // 检查麦克风更改时的设备id
  useEffect(() => {
    if (microphoneDevices.length > 0 && !microphoneDeviceId) {
      const lastMicrophoneId = preferencesStore.microphoneId;
      lastMicrophoneId
        ? setMicrophoneDeviceId(lastMicrophoneId)
        : setMicrophoneDeviceId(microphoneDevices[0].deviceId);
    }
  }, [preferencesStore, microphoneDeviceId, microphoneDevices]);

  const joinRoom = async (): Promise<void> => {
    preferencesStore.updateCameraId(cameraDeviceId);
    preferencesStore.updateMicrophoneId(microphoneDeviceId);
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
