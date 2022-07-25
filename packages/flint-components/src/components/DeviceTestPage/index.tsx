import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

import { Device } from "./constants";
import { CameraTest } from "./CameraTest";

export type { Device };

export interface DeviceTestPanelProps {
  cameraDevices?: Device[];
  speakerDevices?: Device[];
  microphoneDevices?: Device[];
  audioResourceSrc?: string;
  speakerTestFileName: string;
  currentCameraDeviceID: string;
  currentSpeakerDeviceID: string;
  currentMicrophoneDeviceID: string;
  microphoneVolume: number;
  isCameraAccessible: boolean;
  isSpeakerAccessible: boolean;
  isMicrophoneAccessible: boolean;
  cameraVideoStreamRef: React.RefObject<HTMLDivElement>;
  setSpeakerDevice: (deviceID: string) => void;
  setCameraDevice: (deviceID: string) => void;
  setMicrophoneDevice: (deviceID: string) => void;
  toggleDeviceTest: () => void;
  joinRoom: () => void;
}

export const DeviceTestPanel: React.FC<DeviceTestPanelProps> = ({
  cameraDevices,
  speakerDevices,
  microphoneDevices,
  audioResourceSrc,
  speakerTestFileName,
  currentCameraDeviceID,
  currentSpeakerDeviceID,
  currentMicrophoneDeviceID,
  microphoneVolume,
  isCameraAccessible,
  isSpeakerAccessible,
  isMicrophoneAccessible,
  cameraVideoStreamRef,
  setCameraDevice,
  setMicrophoneDevice,
  setSpeakerDevice,
  toggleDeviceTest,
  joinRoom,
}) => {
  const { t } = useTranslation();

  return (
    <div className="device-test-panel-container">
      <div className="device-test-panel-title-box">{t("device-test")}</div>
      <div className="device-test-panel-inner-box">
        <div className="device-test-panel-inner-left">
          <CameraTest
            cameraDevices={cameraDevices}
            cameraVideoStreamRef={cameraVideoStreamRef}
            currentCameraDeviceID={currentCameraDeviceID}
            isCameraAccessible={isCameraAccessible}
            setCameraDevice={setCameraDevice}
          />
        </div>
      </div>
      <div className="device-test-panel-tips-box">
        <div className="device-test-panel-tips-radio"></div>
        <div className="device-test-panel-join-btn"></div>
      </div>
    </div>
  );
};
