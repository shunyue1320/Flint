import "./style.less";

import React from "react";
import { useTranslation } from "react-i18next";

import { SVGSend, SVGChatBanning } from "../../FlatIcons";

export interface ChatTypeBoxProps {
  /** 只有房主才能禁止聊天 */
  isCreator: boolean;
  isBan: boolean;
  onBanChange: () => void;
  onMessageSend: (text: string) => Promise<void>;
}

export const ChatTypeBox = function ChatTypeBox({ isCreator, isBan, onBanChange, onMessageSend }) {
  const { t } = useTranslation();

  return (
    <div className="chat-typebox">
      {isCreator && (
        <button className="chat-typebox-icon" title={t("ban")} onClick={onBanChange}>
          <SVGChatBanning active={isBan} />
        </button>
      )}
    </div>
  );
};
