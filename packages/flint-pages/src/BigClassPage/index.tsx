import "./style.less";

import React, { useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslate } from "@netless/flint-i18n";
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
} from "@netless/flint-components";
import { observer } from "mobx-react-lite";
import { message } from "antd";

// import { runtime } from "../utils/runtime";
// import { RouteNameType, RouteParams } from "../../utils/routes";
// import { RecordingConfig, useClassRoomStore, User } from "../../stores/class-room-store";
// import { RtcChannelType } from "../../api-middleware/rtc/room";
// import { CloudStorageButton } from "../components/CloudStorageButton";
import InviteButton from "../components/InviteButton";
import { ExitRoomConfirmType, useExitRoomConfirmModal } from "../components/ExitRoomConfirm";
import { Whiteboard } from "../components/Whiteboard";
import { RealtimePanel } from "../components/RealtimePanel";
import { RTCAvatar } from "../components/RTCAvatar";
import { ChatPanel } from "../components/ChatPanel";
import { withClassroomStore, WithClassroomStoreProps } from "../utils/with-classroom-store";
import { WindowsSystemBtnContext } from "../components/StoreProvider";

// const recordingConfig: RecordingConfig = Object.freeze({
//   channelType: RtcChannelType.Broadcast, // 广播
//   transcodingConfig: {},
//   maxIdleTime: 60,
//   subscribeUidGroup: 0,
// });

export type BigClassPageProps = {};

export const BigClassPage = withClassroomStore<BigClassPageProps>(
  observer<WithClassroomStoreProps<BigClassPageProps>>(function BigClassPage({ classroomStore }) {
    // useLoginCheck();
    const t = useTranslate();
    // const whiteboardStore = classroomStore.whiteboardStore;
    const windowsBtn = useContext(WindowsSystemBtnContext);

    const { confirm, ...exitConfirmModalProps } = useExitRoomConfirmModal(classroomStore);
    const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

    return (
      <div className="big-class-realtime-container">
        <div className="big-class-realtime-container">
          <div className="big-class-realtime-box">
            {windowsBtn ? (
              <div>windowsBtn1</div>
            ) : (
              <TopBar left={renderTopBarLeft()} right={renderTopBarRight()} />
            )}

            <div className="big-class-realtime-content">
              <div className="big-class-realtime-content-container">
                {/* <Whiteboard classRoomStore={classroomStore} whiteboardStore={whiteboardStore} /> */}
              </div>
              {renderRealtimePanel()}
            </div>
          </div>
        </div>
      </div>
    );

    function renderTopBarLeft(): React.ReactNode {
      return (
        <>
          <NetworkStatus networkQuality={classroomStore.networkQuality} />
        </>
      );
    }

    function renderTopBarRight(): React.ReactNode {
      return (
        <>
          {classroomStore.isCreator && (
            <CloudRecordBtn
              isRecording={classroomStore.isRecording}
              onClick={() => {
                void classroomStore.toggleRecording({
                  onStop() {
                    void message.success(t("recording-completed-tips"));
                  },
                });
              }}
            />
          )}

          {/* TODO：打开云存储子窗口 */}
          {/* <CloudStorageButton classroom={classroomStore} /> */}
          <InviteButton roomInfo={classroomStore.roomInfo} />
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
      const { creator } = classroomStore.users;
      console.log("creator===", creator);
      return (
        <RealtimePanel
          chatSlot={
            // 聊天列表
            <div>聊天列表</div>
            // <ChatPanel classRoomStore={classroomStore} maxSpeakingUsers={1}></ChatPanel>
          }
          isShow={isRealtimeSideOpen}
          isVideoOn={classroomStore.isJoinedRTC}
          videoSlot={
            <div className="big-class-realtime-rtc-box">
              {/* 老师 */}
              <RTCAvatar
                avatarUser={creator}
                isAvatarUserCreator={true}
                isCreator={classroomStore.isCreator}
                rtcAvatar={creator && classroomStore.rtc.getAvatar(creator.rtcUID)}
                updateDeviceState={classroomStore.updateDeviceState}
                userUUID={classroomStore.userUUID}
              />
              {/* 发言的学生 */}
              {classroomStore.onStageUserUUIDs.length > 0 && (
                <RTCAvatar
                  avatarUser={classroomStore.firstOnStageUser}
                  isAvatarUserCreator={false}
                  isCreator={classroomStore.isCreator}
                  rtcAvatar={
                    classroomStore.firstOnStageUser &&
                    classroomStore.rtc.getAvatar(classroomStore.firstOnStageUser.rtcUID)
                  }
                  updateDeviceState={classroomStore.updateDeviceState}
                  userUUID={classroomStore.userUUID}
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
  }),
);

// export const BigClassPage2 = observer<BigClassPageProps>(function BigClassPage({ classroomStore }) {
//   const t = useTranslate();

//   // const { i18n, t } = useTranslation();
//   const params = useParams<RouteParams<RouteNameType.BigClassPage>>();
//   const classRoomStore = useClassRoomStore({ ...params, recordingConfig, i18n });
//   const whiteboardStore = classRoomStore.whiteboardStore;

//   const { confirm } = useExitRoomConfirmModal(classRoomStore);

//   // 正在参与说话的
//   const [speakingJoiner, setSpeakingJoiner] = useState<User | undefined>(() =>
//     classRoomStore.users.speakingJoiners.length > 0
//       ? classRoomStore.users.speakingJoiners[0]
//       : void 0,
//   );

//   const [isRealtimeSideOpen, openRealtimeSide] = useState(true);

//   const loadingPageRef = useRef(false);

//   return (
//     <div className="big-class-realtime-container">
//       {loadingPageRef.current && <div>LoadingPage</div>}
//       <div className="big-class-realtime-box">
//         <TopBar isMac={runtime.isMac} left={renderTopBarLeft()} right={renderTopBarRight()} />
//         <div className="big-class-realtime-content">
//           <div className="big-class-realtime-content-container">
//             <Whiteboard classRoomStore={classRoomStore} whiteboardStore={whiteboardStore} />
//           </div>

//           {renderRealtimePanel()}
//         </div>
//       </div>
//     </div>
//   );

//   function renderTopBarLeft(): React.ReactNode {
//     return (
//       <>
//         <NetworkStatus networkQuality={classRoomStore.networkQuality} />
//       </>
//     );
//   }

//   function renderTopBarRight(): React.ReactNode {
//     return (
//       <>
//         {!classRoomStore.isRemoteScreenSharing && (
//           <TopBarRightBtn
//             icon={<SVGScreenSharing active={classRoomStore.isScreenSharing} />}
//             title={t("share-screen.self")}
//             onClick={() => classRoomStore.toggleShareScreen()}
//           />
//         )}

//         {classRoomStore.isCreator && (
//           <CloudRecordBtn
//             isRecording={classRoomStore.isRecording}
//             onClick={() => {
//               void classRoomStore.toggleRecording({
//                 onStop() {
//                   void message.success(t("recording-completed-tips"));
//                 },
//               });
//             }}
//           />
//         )}

//         {/* TODO：打开云存储子窗口 */}
//         {/* <CloudStorageButton classroom={classRoomStore} /> */}
//         <InviteButton roomInfo={classRoomStore.roomInfo} />
//         <TopBarRightBtn
//           icon={<SVGExit />}
//           title={t("exit")}
//           onClick={() => confirm(ExitRoomConfirmType.ExitButton)}
//         />
//         <TopBarDivider />
//         <TopBarRightBtn
//           icon={isRealtimeSideOpen ? <SVGMenuUnfold /> : <SVGMenuFold />}
//           title={isRealtimeSideOpen ? t("side-panel.hide") : t("side-panel.show")}
//           onClick={handleSideOpenerSwitch}
//         />
//       </>
//     );
//   }

//   function renderRealtimePanel(): React.ReactNode {
//     const { creator } = classRoomStore.users;

//     return (
//       <RealtimePanel
//         chatSlot={
//           // 聊天列表
//           <ChatPanel
//             classRoomStore={classRoomStore}
//             disableMultipleSpeakers={true}
//             isShowAllOfStage={classRoomStore.isCreator}
//           ></ChatPanel>
//         }
//         isShow={isRealtimeSideOpen}
//         isVideoOn={classRoomStore.isJoinedRTC}
//         videoSlot={
//           <div className="big-class-realtime-rtc-box">
//             <RTCAvatar
//               avatarUser={creator}
//               isAvatarUserCreator={true}
//               isCreator={classRoomStore.isCreator}
//               rtcAvatar={creator && classRoomStore.rtc.getAvatar(creator.rtcUID)}
//               updateDeviceState={classRoomStore.updateDeviceState}
//               userUUID={classRoomStore.userUUID}
//             />
//             {speakingJoiner && (
//               <RTCAvatar
//                 avatarUser={speakingJoiner}
//                 isAvatarUserCreator={false}
//                 isCreator={classRoomStore.isCreator}
//                 rtcAvatar={classRoomStore.rtc.getAvatar(speakingJoiner.rtcUID)}
//                 updateDeviceState={classRoomStore.updateDeviceState}
//                 userUUID={classRoomStore.userUUID}
//               />
//             )}
//           </div>
//         }
//       />
//     );
//   }

//   function handleSideOpenerSwitch(): void {
//     openRealtimeSide(isRealtimeSideOpen => !isRealtimeSideOpen);
//   }
// });

export default BigClassPage;
