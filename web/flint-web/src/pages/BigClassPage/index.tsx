import "./style.less";

import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CloudRecordBtn,
  TopBar,
  NetworkStatus,
  TopBarRightBtn,
  SVGScreenSharing,
  SVGExit,
  TopBarDivider,
  SVGMenuUnfold,
  SVGMenuFold,
} from "flint-components";
import { observer } from "mobx-react-lite";
import { message } from "antd";

import { runtime } from "../../utils/runtime";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { RecordingConfig, useClassRoomStore } from "../../stores/class-room-store";
import { RtcChannelType } from "../../api-middleware/rtc/room";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import InviteButton from "../../components/InviteButton";
import { ExitRoomConfirmType, useExitRoomConfirmModal } from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";

const recordingConfig: RecordingConfig = Object.freeze({
  channelType: RtcChannelType.Broadcast, // 广播
  transcodingConfig: {},
  maxIdleTime: 60,
  subscribeUidGroup: 0,
});

export type BigClassPageProps = {};

export const BigClassPage = observer<BigClassPageProps>(function BigClassPage() {
  const { i18n, t } = useTranslation();
  const params = useParams<RouteParams<RouteNameType.BigClassPage>>();
  const classRoomStore = useClassRoomStore({ ...params, recordingConfig, i18n });
  const whiteboardStore = classRoomStore.whiteboardStore;

  const { confirm } = useExitRoomConfirmModal(classRoomStore);

  const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

  const loadingPageRef = useRef(false);

  return (
    <div className="big-class-realtime-container">
      {loadingPageRef.current && <div>LoadingPage</div>}
      <div className="big-class-realtime-box">
        <TopBar isMac={runtime.isMac} left={renderTopBarLeft()} right={renderTopBarRight()} />
        <div className="big-class-realtime-content">
          <div className="big-class-realtime-content-container">
            <Whiteboard classRoomStore={classRoomStore} whiteboardStore={whiteboardStore} />
          </div>
        </div>
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

  function renderTopBarRight(): React.ReactNode {
    return (
      <>
        {whiteboardStore.isWritable && !classRoomStore.isRemoteScreenSharing && (
          <TopBarRightBtn
            icon={<SVGScreenSharing active={classRoomStore.isScreenSharing} />}
            title={t("share-screen.self")}
            onClick={() => classRoomStore.toggleShareScreen()}
          />
        )}

        {classRoomStore.isCreator && (
          <CloudRecordBtn
            isRecording={classRoomStore.isRecording}
            onClick={() => {
              void classRoomStore.toggleRecording({
                onStop() {
                  void message.success(t("recording-completed-tips"));
                },
              });
            }}
          />
        )}

        {/* TODO：打开云存储子窗口 */}
        <CloudStorageButton classroom={classRoomStore} />
        <InviteButton roomInfo={classRoomStore.roomInfo} />
        <TopBarRightBtn
          icon={<SVGExit />}
          title={t("exit")}
          onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
        />
        <TopBarDivider />
        <TopBarRightBtn
          icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
          title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
          onClick={handleSideOpenerSwitch}
        />
      </>
    );
  }

  function handleSideOpenerSwitch(): void {
    openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
  }
});

export default BigClassPage;
