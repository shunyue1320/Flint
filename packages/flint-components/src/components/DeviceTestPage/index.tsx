import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

export interface DeviceTestPanelProps {}

export const DeviceTestPanel: React.FC<DeviceTestPanelProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="device-test-panel-container">
      <div className="device-test-panel-title-box">{t("device-test")}</div>
      <div className="device-test-panel-inner-box"></div>
      <div className="device-test-panel-tips-box">
        <div className="device-test-panel-tips-radio"></div>
        <div className="device-test-panel-join-btn"></div>
      </div>
    </div>
  );
};
