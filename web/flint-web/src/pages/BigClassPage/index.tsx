import "./style.less";

import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopBar, NetworkStatus } from "flint-components";

import { runtime } from "../../utils/runtime";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { RecordingConfig, useClassRoomStore } from "../../stores/class-room-store";
import { RtcChannelType } from "../../api-middleware/rtc/room";

const recordingConfig: RecordingConfig = Object.freeze({
  channelType: RtcChannelType.Broadcast, // 广播
  transcodingConfig: {},
  maxIdleTime: 60,
  subscribeUidGroup: 0,
});

export type BigClassPageProps = {};

export const BigClassPage: React.FC<BigClassPageProps> = () => {
  const { i18n, t } = useTranslation();
  const params = useParams<RouteParams<RouteNameType.BigClassPage>>();
  const classRoomStore = useClassRoomStore({ ...params, recordingConfig, i18n });

  const loadingPageRef = useRef(false);

  return (
    <div className="big-class-realtime-container">
      {loadingPageRef.current && <div>LoadingPage</div>}
      <div className="big-class-realtime-box">
        <TopBar isMac={runtime.isMac} left={renderTopBarLeft()} />
      </div>
    </div>
  );

  function renderTopBarLeft(): React.ReactNode {
    return (
      <>
        <NetworkStatus networkQuality={classRoomStore.networkQuality} />
      </>
    );
  }
};

export default BigClassPage;
