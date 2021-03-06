import "./style.less";

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { Device } from "../constants";
import { DeviceTestSelect } from "../DeviceTestSelect";
import cameraDisabledSVG from "../icons/camera-disabled.svg";

export interface CameraTestProps {
  cameraDevices?: Device[];
  isCameraAccessible: boolean;
  currentCameraDeviceID: string;
  cameraVideoStreamRef: React.RefObject<HTMLDivElement>;
  setCameraDevice: (deviceID: string) => void;
}

export const CameraTest: React.FC<CameraTestProps> = ({
  cameraDevices,
  isCameraAccessible,
  currentCameraDeviceID,
  cameraVideoStreamRef,
  setCameraDevice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="camera-test-container">
      <div className="camera-test-text">{t("camera")}</div>
      <div className="camera-test-select-box">
        <DeviceTestSelect
          currentDeviceID={currentCameraDeviceID}
          devices={cameraDevices}
          isDeviceAccessible={isCameraAccessible}
          onChange={setCameraDevice}
        />
      </div>
      <div className="camera-test-wrapper">
        {/* 通过 ref 在这里显示相机捕获的视频流 */}
        <div ref={cameraVideoStreamRef} className="camera-box" />
        <div
          className={classNames("camera-no-accredit-box", {
            visible: !isCameraAccessible,
          })}
        >
          <img src={cameraDisabledSVG} />
          <span>{t("enable-camera-permission-tip")}</span>
        </div>
      </div>
    </div>
  );
};
