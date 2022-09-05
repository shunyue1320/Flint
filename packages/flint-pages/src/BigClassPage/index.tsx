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
import { RecordingConfig, useClassRoomStore, User } from "../../stores/class-room-store";
import { RtcChannelType } from "../../api-middleware/rtc/room";
import { CloudStorageButton } from "../../components/CloudStorageButton";
import InviteButton from "../../components/InviteButton";
import { ExitRoomConfirmType, useExitRoomConfirmModal } from "../../components/ExitRoomConfirm";
import { Whiteboard } from "../../components/Whiteboard";
import { RealtimePanel } from "../../components/RealtimePanel";
import { RTCAvatar } from "../../components/RTCAvatar";
import { ChatPanel } from "../../components/ChatPanel";

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

  // 正在参与说话的
  const [speakingJoiner, setSpeakingJoiner] = useState<User | undefined>(() =>
    classRoomStore.users.speakingJoiners.length > 0
      ? classRoomStore.users.speakingJoiners[0]
      : void 0,
  );

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

          {renderRealtimePanel()}
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

  function renderRealtimePanel(): React.ReactNode {
    const { creator } = classRoomStore.users;

    return (
      <RealtimePanel
        chatSlot={
          // 聊天列表
          <ChatPanel
            classRoomStore={classRoomStore}
            disableMultipleSpeakers={true}
            isShowAllOfStage={classRoomStore.isCreator}
          ></ChatPanel>
        }
        isShow={isRealtimeSideOpen}
        isVideoOn={classRoomStore.isJoinedRTC}
        videoSlot={
          <div className="big-class-realtime-rtc-box">
            <RTCAvatar
              avatarUser={creator}
              isAvatarUserCreator={true}
              isCreator={classRoomStore.isCreator}
              rtcAvatar={creator && classRoomStore.rtc.getAvatar(creator.rtcUID)}
              updateDeviceState={classRoomStore.updateDeviceState}
              userUUID={classRoomStore.userUUID}
            />
            {speakingJoiner && (
              <RTCAvatar
                avatarUser={speakingJoiner}
                isAvatarUserCreator={false}
                isCreator={classRoomStore.isCreator}
                rtcAvatar={classRoomStore.rtc.getAvatar(speakingJoiner.rtcUID)}
                updateDeviceState={classRoomStore.updateDeviceState}
                userUUID={classRoomStore.userUUID}
              />
            )}
          </div>
        }
      />
    );
  }

  function handleSideOpenerSwitch(): void {
    openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
  }
});

export default BigClassPage;
