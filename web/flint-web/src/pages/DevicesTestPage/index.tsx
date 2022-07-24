import "./style.less";
import React from "react";
import { DeviceTestPanel } from "flint-components";

export const DevicesTestPage: React.FC = () => {
  return (
    <div className="device-test-page-container">
      <div className="device-test-panel-box">
        <DeviceTestPanel />
      </div>
    </div>
  );
};

export default DevicesTestPage;
