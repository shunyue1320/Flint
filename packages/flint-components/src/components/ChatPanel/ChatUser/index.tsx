import "./style.less";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { User } from "../../../types/user";
import { useTranslation } from "react-i18next";

export interface ChatUserProps {
  // 房主uuid
  ownerUUID: string;
  // 当前用户uuid
  userUUID: string;
  // 用户数据
  user: User;
  // 当老师接受举手时
  onAcceptRaiseHand: (uid: string) => void;
  // 用户停止说话
  onEndSpeaking: (uid: string) => void;
  // 函数生成占位符化身
  generateAvatar: (uid: string) => string;
}

export const ChatUser = observer<ChatUserProps>(function ChatUser({
  ownerUUID,
  userUUID,
  user,
  onAcceptRaiseHand,
  onEndSpeaking,
  generateAvatar,
}) {
  const { t } = useTranslation();
  const [isAvatarLoadFailed, setAvatarLoadFailed] = useState(false);
  // 当前用户是房间所有者吗
  const isCreator = ownerUUID === userUUID;
  // 此聊天用户元素是否属于当前用户
  const isCurrentUser = userUUID === user.userUUID;

  return (
    <div className="chat-user">
      <img
        alt={`User ${user.name}`}
        className="chat-user-avatar"
        src={isAvatarLoadFailed ? generateAvatar(userUUID) : user.avatar}
        onError={() => setAvatarLoadFailed(true)}
      />
      <span className="chat-user-name">{user.name}</span>
      {ownerUUID === user.userUUID ? (
        <span className="chat-user-status is-teacher">{t("teacher")}</span>
      ) : user.isSpeak ? (
        // 在对话，老师端 或 学生显示 结束 按钮
        <>
          <span className="chat-user-status is-speaking">{t("during-the-presentation")}</span>
          {(isCreator || isCurrentUser) && (
            <button
              className="chat-user-ctl-btn is-speaking"
              onClick={() => onEndSpeaking(user.userUUID)}
            >
              {t("end")}
            </button>
          )}
        </>
      ) : user.isRaiseHand ? (
        // 举手后，老师端显示 通过 按钮
        <>
          <span className="chat-user-status is-hand-raising">{t("raised-hand")}</span>
          {isCreator && (
            <button
              className="chat-user-ctl-btn is-hand-raising"
              onClick={() => onAcceptRaiseHand(user.userUUID)}
            >
              {t("agree")}
            </button>
          )}
        </>
      ) : (
        isCurrentUser && <span className="chat-user-status is-teacher">{t("me")}</span>
      )}
    </div>
  );
});
