import React from "react";
import { observer } from "mobx-react-lite";
import { ClassroomStore, User } from "@netless/flint-stores";
import { ChatPanel as ChatPanelImpl, useComputed } from "@netless/flint-components";
import { generateAvatar } from "../../utils/generate-avatar";

// @TODO add rtm
const noop = async (): Promise<void> => void 0;

export interface ChatPanelProps {
  classRoomStore: ClassroomStore;
  disableEndSpeaking?: boolean;
  // 最大同时接受举手人数
  maxSpeakingUsers?: number;
}

export const ChatPanel = observer<ChatPanelProps>(function ChatPanel({
  classRoomStore,
  disableEndSpeaking,
  maxSpeakingUsers = 1,
}) {
  const users = useComputed(() => {
    const onStageUsers = classRoomStore.onStageUserUUIDs
      .map(userUUID => classRoomStore.users.cachedUsers.get(userUUID))
      .filter((user): user is User => !!user);
    const { creator, handRaisingJoiners, otherJoiners } = classRoomStore.users;
    return creator
      ? [...onStageUsers, ...handRaisingJoiners, creator, ...otherJoiners]
      : [...onStageUsers, ...handRaisingJoiners, ...otherJoiners];
  }).get();

  const handHandRaising = classRoomStore.users.handRaisingJoiners.length > 0;

  return (
    <ChatPanelImpl
      // 禁用结束讲话
      disableEndSpeaking={disableEndSpeaking}
      generateAvatar={generateAvatar}
      getUserByUUID={(userUUID: string) => classRoomStore.users.cachedUsers.get(userUUID)}
      hasHandRaising={handHandRaising}
      // 是否禁言
      isBan={classRoomStore.isBan}
      isCreator={classRoomStore.isCreator}
      loadMoreRows={noop}
      // 消息列表
      messages={classRoomStore.chatStore.messages}
      openCloudStorage={() => classRoomStore.toggleCloudStoragePanel(true)}
      // 创建者UUID
      ownerUUID={classRoomStore.ownerUUID}
      // 举手人数
      unreadCount={classRoomStore.users.handRaisingJoiners.length || null}
      // 当前用户UUID
      userUUID={classRoomStore.userUUID}
      users={users}
      // 允许举手
      withAcceptHands={handHandRaising && classRoomStore.onStageUserUUIDs.length < maxSpeakingUsers}
      // 接收举手事件
      onAcceptRaiseHand={(userUUID: string) => {
        if (classRoomStore.onStageUserUUIDs.length < maxSpeakingUsers) {
          classRoomStore.acceptRaiseHand(userUUID);
        }
      }}
      // 禁言改变事件
      onBanChange={classRoomStore.onToggleBan}
      // 取消所有举手事件
      onCancelAllHandRaising={classRoomStore.onCancelAllHandRaising}
      // 结束举手事件
      onEndSpeaking={userUUID => {
        void classRoomStore.onStaging(userUUID, false);
      }}
      // 发送消息事件
      onMessageSend={classRoomStore.onMessageSend}
    />
  );
});

export default ChatPanel;
